import type { AssistBaseFetchOptions, AssistMajorFetchOptions } from './types';

const YEAR_BASE = 1950;

export function createAssistMajorURL({ year, fromSchoolID, toSchoolID }: AssistMajorFetchOptions): string {
    return `https://assist.org/api/agreements?receivingInstitutionId=${toSchoolID}&sendingInstitutionId=${fromSchoolID}&academicYearId=${year - YEAR_BASE}&categoryCode=major`;
}

export function createAssistArticulationURL({ year, fromSchoolID, toSchoolID }: AssistMajorFetchOptions): string {
    return `https://assist.org/api/articulation/Agreements?Key=${year - YEAR_BASE}/${fromSchoolID}/to/${toSchoolID}/AllMajors`;
}

export function createAssistArticulationURLFromKey(key: string): string {
    return `https://assist.org/api/articulation/Agreements?Key=${key}`;
}

export function createAssistIGETCURL({ year, fromSchoolID }: AssistBaseFetchOptions): string {
    return `https://assist.org/api/transferability/courses?institutionId=${fromSchoolID}&academicYearId=${year - YEAR_BASE}&listType=IGETC`;
}