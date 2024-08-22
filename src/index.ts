import type { Agreement, AgreementByMajor, Course, Instruction, School, Section, AssistMajorFetchOptions, AssistBaseFetchOptions, IGETCCourse, TransferArea } from './types';
import { createAssistMajorURL, createAssistArticulationURL, createAssistArticulationURLFromKey, createAssistIGETCURL } from './utils';


/**
 * Fetches the Assist Articulation URL and processes the response data into a more usable format.
 * @param url - The URL to fetch the data from.
 * @returns An object containing the agreements, from school, to school, and agreeements groups.
 */
export async function fetchAssistArticulationURL(url: string): Promise<{ agreements: Agreement[], from: School, to: School, groups: Record<string, { instruction: Instruction | null, sections: Section[] }[]> }> {
    if (!url.startsWith('https://assist.org/api/articulation/Agreements')) throw new Error('Invalid URL provided. Must be an Assist API Articulation URL. See createAssistArticulationURL or createAssistArticulationURLFromKey for more information.');
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const responseJSON = await response.json();
    const to = JSON.parse(responseJSON.result.receivingInstitution);
    const from = JSON.parse(responseJSON.result.sendingInstitution);

    if (!responseJSON.isSuccessful) throw new Error('Failed to fetch data from assist.org');

    //Useful data is in responseJSON.results.articulations
    const agreementsRaw = JSON.parse(responseJSON.result.articulations);

    //Loop through agreements and return the data in the format we want
    const agreements = agreementsRaw.map((e: any) => {
        if (!e.articulation) return null;
        if (!e.articulation.sendingArticulation) return null;
        if (!e.articulation.sendingArticulation.items) return null;
        return {
            target: e.articulation.course as Course,
            courses: e.articulation.sendingArticulation.items.flatMap((e: any) => {
                return {
                    group: e.courseConjunction,
                    classes: e.items.flatMap((e: any) => e)
                }
            }) as Agreement[]
        }
    }).filter((e: any) => e !== null);

    //We also want to parse groups which is in the responseJSON.results.templateAssets
    const templateAssetsRaw = JSON.parse(responseJSON.result.templateAssets).sort((a: any, b: any) => a.position - b.position);

    const groups = {
        "DEFAULT": []
    } as Record<string, {
        instruction: Instruction | null,
        sections: Section[]
    }[]>;

    for (const section of templateAssetsRaw) {
        const { instruction, sections } = section
        if (section.type === 'RequirementTitle') {
            groups[section.content] = [];
        }
        else if (section.type === 'RequirementGroup') {
            //Get latest section added
            const latestSectionKey = Object.keys(groups).pop() as string;

            groups[latestSectionKey].push(
                {
                    instruction,
                    sections: sections
                        .filter((s: any) => s.rows && s.rows.length > 0)
                        .map((s: any) => {
                            return s.rows.flatMap((r: any) => r.cells)
                        })
                }
            );
        }
    }

    //Delete the default group if it's empty
    if (groups.DEFAULT.length === 0) delete groups.DEFAULT;

    return {
        from,
        to,
        agreements,
        groups
    };
}

/**
 * Fetches majors based on the provided options.
 * @param year - The year of the major agreements.
 * @param fromSchoolID - The Assist ID of the school from which the major agreements are being fetched.
 * @param toSchoolID - The Assist ID of the school to which the major agreements are being fetched.
 * @returns An array of majors.
 * @throws If the fetch request fails or if no major agreements are found.
 */
export async function fetchMajors({ year, fromSchoolID, toSchoolID }: AssistMajorFetchOptions): Promise<{
    label: string;
    key: string;
}[]> {
    const url = createAssistMajorURL({ year, fromSchoolID, toSchoolID });

    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const responseJSON = await response.json() as {
        reports: {
            label: string;
            key: string;
        }[],
    }

    if (!responseJSON.reports || !responseJSON.reports.length) throw new Error(`No major agreements found for ${fromSchoolID} -> ${toSchoolID}`);

    return responseJSON.reports;
}

/**
 * Fetches all agreements based on the provided options.
 * @param year - The year of the agreements.
 * @param fromSchoolID - The ID of the school from which the agreements are made.
 * @param toSchoolID - The ID of the school to which the agreements are made.
 * @returns A promise that resolves to the fetched agreements.
 */
export async function fetchAllAgreements({ year, fromSchoolID, toSchoolID }: AssistMajorFetchOptions): Promise<{
    agreements: Agreement[];
    from: School;
    to: School;
    groups: Record<string, {
        instruction: Instruction | null;
        sections: Section[];
    }[]>;
}> {
    const url = createAssistArticulationURL({ year, fromSchoolID, toSchoolID });
    return await fetchAssistArticulationURL(url);
}

/**
 * Fetches agreements by major.
 * 
 * @param year - The year of the agreements.
 * @param fromSchoolID - The ID of the school from which the agreements are made.
 * @param toSchoolID - The ID of the school to which the agreements are made.
 * @returns An array of AgreementByMajor objects representing the agreements by major.
 */
export async function fetchAgreementsByMajor({ year, fromSchoolID, toSchoolID }: AssistMajorFetchOptions): Promise<AgreementByMajor[]> {
    const majors = await fetchMajors({ year, fromSchoolID, toSchoolID });

    const agreementsByMajors = [] as AgreementByMajor[];

    for (const major of majors) {
        const agreements = await fetchAssistArticulationURL(createAssistArticulationURLFromKey(major.key));

        const fromSchool = agreements.from
        const toSchool = agreements.to

        const agreementByMajor = {
            major: major.label,
            from: fromSchool,
            to: toSchool,
            agreements: agreements.agreements,
            groups: agreements.groups
        } as AgreementByMajor;


        agreementsByMajors.push(agreementByMajor);
    }

    return agreementsByMajors;
}

/**
 * Fetches the IGETC transferable coureses from a school.
 * Filters out courses that have been removed from the agreement.
 * @param year - The year of the agreements.
 * @param fromSchoolID - The ID of the school from which the agreements are made.
 * @returns An array of IGETC transferable courses.
 */
export async function fetchIGETC({ year, fromSchoolID }: AssistBaseFetchOptions): Promise<IGETCCourse[]> {
    const url = createAssistIGETCURL({ year, fromSchoolID });
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const responseJSON = await response.json();

    if (!responseJSON.courseInformationList) throw new Error('No results found');

    const courses = responseJSON.courseInformationList.map((e: any) => {
        return {
            courseIdentifierParentId: e.courseIdentifierParentId,
            courseTitle: e.courseTitle,
            courseNumber: e.courseNumber,
            prefix: e.prefixCode,
            prefixDescription: e.prefixDescription,
            department: e.departmentName,
            minUnits: e.minUnits,
            maxUnits: e.maxUnits,
            transferAreas: e.transferAreas.filter((e: any) =>
                new Date(e.endDate) > new Date()
            ).map((e: any) => {
                return {
                    areaType: e.areaType,
                    areaParentId: e.areaParentId,
                    code: e.code,
                    codeDescription: e.codeDescription.trim(),
                    courseIdentifierParentId: e.courseIdentifierParentId,
                    endDate: e.endDate,
                } as TransferArea;
            }),
        } as IGETCCourse;
    }).filter(((c: IGETCCourse) => c.transferAreas.length > 0));

    return courses;
}