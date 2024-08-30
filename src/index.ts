import type { Agreement, AgreementByMajor, Course, Group, School, Section, AssistMajorFetchOptions, AssistBaseFetchOptions, IGETCCourse, TransferArea } from './types';
import { createAssistMajorURL, createAssistArticulationURL, createAssistArticulationURLFromKey, createAssistIGETCURL } from './utils';

//INTERNAL
function processToGroups(data: any[]): Record<string, Group[]> {
    data.sort((a: any, b: any) => a.position - b.position);

    let prefix = [] as string[];
    let numTitleMade = 0
    let sectionCreated = false

    const groups = {
        "DEFAULT": []
    } as Record<string, Group[]>;

    for (const group of data) {
        const { sections } = group
        if (group.type === 'RequirementTitle') {
            //We want to chain subsequent titles together
            if (numTitleMade > 1 && sectionCreated) {
                prefix = [];
            }

            prefix.push(group.content!);
            numTitleMade++
        }
        else if (group.type === 'RequirementGroup') {
            let groupName = prefix.join(', ');
            prefix.pop();
            sectionCreated = true;
            numTitleMade = 0;

            if (!groupName) {
                groupName = 'DEFAULT';
            } else {
                groups[groupName] = [];
            }
            
            //Get latest section added
            groups[groupName].push(
                {
                    type: group.type,
                    groupInstruction: group.instruction,
                    groupAttributes: group.attributes?.map((a: any) => a.content),
                    groupAdvisements: group.advisements,
                    sections: sections!
                        .sort((a: any, b: any) => a.position - b.position)
                        .filter((s:any)=> s.rows)
                        .map((s: any) => {
                            return {
                                type: s.type,
                                sectionAdvisements: s.advisements,
                                sectionAttributes: s.attributes?.map((a: any) => a.content),
                                agreements: s.rows.map((r: any) => {
                                    return {
                                        agreementAttributes: r.attributes ?? [],
                                        courses: r.cells.map((c: any) => {
                                            if(c.type === 'GeneralEducation'){
                                                return {
                                                    templateCellId: c.id,
                                                    type: "GeneralEducation",
                                                    generalEducationArea:c.generalEducationArea,
                                                    courseAttributes: c.courseAttributes?.map((a: any) => a.content) ?? [],
                                                    generalAttributes: c.generalEducationAreaAttributes?.map((a: any) => a.content) ?? [],
                                                    courses: c.generalEducationArea.coureses
                                                }
                                            }else if (c.type === 'Series') {
                                                return {
                                                    templateCellId: c.id,
                                                    type: "Series",
                                                    instruction: c.series.conjunction,
                                                    seriesAttributes: c.seriesAttributes?.map((a: any) => a.content),
                                                    generalAttributes: c.attributes?.map((a: any) => a.content),
                                                    courses: c.series.courses
                                                }
                                            } else {
                                                return {
                                                    templateCellId: c.id,
                                                    type: "Course",
                                                    courseAttributes: c.courseAttributes?.map((a: any) => a.content),
                                                    generalAttributes: c.attributes?.map((a: any) => a.content),
                                                    courses: [c.course]
                                                }
                                            }
                                        })
                                    }
                                }).sort((a: any, b: any) => a.position - b.position)
                            }
                        })
                }
            );
        }
    }

    //Delete the default group if it's empty
    if (groups.DEFAULT.length === 0) delete groups.DEFAULT;
    return groups;
}

function processFromAgreements(data: any[]): Agreement[] {
    return data.map((e: any) => {
        return {
            templateCellId: e.templateCellId,
            receivingAttributes: e.receivingAttributes,
            articulation: {
                type: e.articulation.type,
                seriesAttributes: e.articulation.seriesAttributes?.map((e: any) => e.content) ?? [],
                courseAttributes: e.articulation.courseAttributes?.map((e: any) => e.content) ?? [],
                generalAttributes: e.articulation.attributes?.map((e: any) => e.content) ?? [],
                receivingAttributes: e.articulation.receivingAttributes?.map((e: any) => e.content) ?? [],
                sendingArticulation: {
                    generalAttributes: e.articulation.sendingArticulation.attributes?.map((e: any) => e.content) ?? [],
                    courseGroupConjunctions: e.articulation.sendingArticulation.courseGroupConjunctions,
                    pickOneGroup: e.articulation.sendingArticulation.items.map((e: any) => {
                        return {
                            instruction: e.courseConjunction,
                            fromClasses: e.items,
                            generalAttributes: e.attributes?.map((e: any) => e.content) ?? []
                        }
                    })
                }

            }
        }
    })
}


/**
 * Fetches the Assist Articulation URL and processes the response data into a more usable format.
 * @param url - The URL to fetch the data from.
 * @returns An object containing the agreements, from school, to school, and agreeements groups.
 */
export async function fetchAssistArticulationURL(url: string): Promise<{ majorID: string, agreements: Agreement[], from: School, to: School, groups: Record<string, Group[]> }> {
    if (!url.startsWith('https://assist.org/api/articulation/Agreements')) throw new Error('Invalid URL provided. Must be an Assist API Articulation URL. See createAssistArticulationURL or createAssistArticulationURLFromKey for more information.');
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const responseJSON = await response.json();
    const to = JSON.parse(responseJSON.result.receivingInstitution);
    const from = JSON.parse(responseJSON.result.sendingInstitution);

    const majorID = `${from.id}-${to.id}-${responseJSON.name}`;

    if (!responseJSON.isSuccessful) throw new Error('Failed to fetch data from assist.org');

    //Useful data is in responseJSON.results.articulations
    const agreementsRaw = JSON.parse(responseJSON.result.articulations);

    //Loop through agreements and return the data in the format we want
    const agreements = processFromAgreements(agreementsRaw);

    //We also want to parse groups which is in the responseJSON.results.templateAssets
    const templateAssetsRaw = JSON.parse(responseJSON.result.templateAssets).sort((a: any, b: any) => a.position - b.position);

    const groups = processToGroups(templateAssetsRaw);

    return {
        majorID,
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
    groups: Record<string, Group[]>;
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