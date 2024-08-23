export interface AssistBaseFetchOptions {
    year: number;
    fromSchoolID: number;
}

export interface AssistMajorFetchOptions extends AssistBaseFetchOptions {
    toSchoolID: number;
}

export interface Instruction {
    type: string;
    conjunction: string;
    amountQuantifier: string;
    amount: number;
    amountUnitType: string;
    id: string;
    selectionType: string;
}

export interface Course {
    id: string;
    position: number;
    courseIdentifierParentId: number;
    courseTitle: string;
    courseNumber: string;
    prefix: string;
    prefixParentId: number;
    prefixDescription: string;
    departmentParentId: number;
    department: string;
    begin: string;
    end: string;
    minUnits: number;
    maxUnits: number;
}

export interface TransferArea {
    areaType: number;
    areaParentId: number;
    code: string;
    codeDescription: string;
    courseIdentifierParentId: number;
    endDate: string;
}

export type IGETCCourse = Omit<Course, 'id' | 'position' | 'departmentParentId' | 'begin' | 'end'> & {
    transferAreas: TransferArea[];
};

export interface Series {
    conjunction: string;
    name: string;
    courses: Course[];
}

export interface Section {
    advisements?: any[];
    courses: {
        type: "Series" | "Course";
        series?: Series;
        course?: Course;
        visibleCrossListedCourses?: any[];
        requisites?: any[];
        courseAttributes?: any[];
        id?: string;
        position?: number;
        attributes?: any[];
    }[];
}

export interface Agreement {
    group: 'And' | 'Or';
    courses: Course[];
}

export interface School {
    id: number;
    code: string;
    isCommunityCollege: boolean;
    category: string;
    termType: string;
    names: { name: string, hasDepartments: boolean, fromYear: number, hideInList: boolean }[];
    termTypeAcademicYears: { termType: string, fromYear: number }[];
}

export interface AgreementByMajor {
    major: string;
    from: School;
    to: School;
    agreements: Agreement[];
    groups: Record<string, { instruction: Instruction | null, sections: Section[] }[]>;
}