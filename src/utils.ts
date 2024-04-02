import type { AssistFetchOptions } from './types';

export function createAssistMajorURL({ year, fromSchoolID, toSchoolID }: AssistFetchOptions): string {
    const yearBase = 1950;
    return `https://assist.org/api/agreements?receivingInstitutionId=${toSchoolID}&sendingInstitutionId=${fromSchoolID}&academicYearId=${year - yearBase}&categoryCode=major`;
}

export function createAssistArticulationURL({ year, fromSchoolID, toSchoolID }: AssistFetchOptions): string {
    const yearBase = 1950;
    return `https://assist.org/api/articulation/Agreements?Key=${year - yearBase}/${fromSchoolID}/to/${toSchoolID}/AllMajors`;
}

export function createAssistArticulationURLFromKey(key: string): string {
    return `https://assist.org/api/articulation/Agreements?Key=${key}`;
}