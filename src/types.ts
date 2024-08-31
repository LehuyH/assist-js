export interface AssistBaseFetchOptions {
    year: number;
    fromSchoolID: number;
}

export interface AssistMajorFetchOptions extends AssistBaseFetchOptions {
    toSchoolID: number;
}

export interface TransferArea {
    areaType: number;
    areaParentId: number;
    code: string;
    codeDescription: string;
    courseIdentifierParentId: number;
    endDate: string;
}

export interface Advisement {
    type: string; // e.g., "NFollowing"
    amount: number;
    amountUnitType: string; // e.g., "Course"
    position: number;
    selectionType: string; // e.g., "Complete"
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

export interface CourseCell {
    templateCellId: string;
    type: "Course";
    courseAttributes?: string[];
    generalAttributes?: string[];
    courses: Course[];
}

export interface SeriesCell {
    templateCellId: string;
    type: "Series";
    instruction: string;
    seriesAttributes?: string[];
    generalAttributes?: string[];
    courses: Course[];
}

export interface GeneralEducationCell {
    templateCellId: string;
    type: "GeneralEducation";
    generalEducationArea: {
        code: string;
        name: string;
    };
    courseAttributes?: string[];
    generalAttributes?: string[];
    courses: Course[];
}

export type CellType = CourseCell | SeriesCell | GeneralEducationCell;

export interface Section {
    type: string;
    sectionAdvisements?: Advisement[];
    sectionAttributes?: string[];
    agreements: Row[];
}

export interface Group {
    type: string;
    groupInstruction?: string;
    groupAttributes?: string[];
    groupAdvisements?: Advisement[];
    sections: Section[];
}


export type IGETCCourse = Omit<Course, 'id' | 'position' | 'departmentParentId' | 'begin' | 'end'> & {
    transferAreas: TransferArea[];
};

export interface Series {
    conjunction: string;
    name: string;
    courses: Course[];
}

export interface ReceivingAttributes {
    type: string;
    attributes: any[];
    courseAttributes?: any[];
    seriesAttributes?: any[];
    seriesCourseAttributes?: any[];
}

export interface Agreement {
    templateCellId: string;
    receivingAttributes: ReceivingAttributes;
    articulation: Articulation;
}

export interface Row{
    agreementAttributes: string[];
    courses: CellType[];
}

export interface Articulation {
    type: string;
    seriesAttributes?: string[];
    courseAttributes?: string[];
    generalAttributes?: string[];
    receivingAttributes?: string[];
    sendingArticulation: {
        generalAttributes?: string[];
        courseGroupConjunctions: string[];
        pickOneGroup: {
            instruction: string;
            fromClasses: Course[];
            generalAttributes?: string[];
        }
    };
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
    groups: Record<string, Group[]>;
}


