export interface PillarFilterItem {
    id: string;
    key: string;
    uniqueId: string;
}

export interface AnalysisPillars {
    id: number;
    assigneeName: string;
    analysisTitle: string;
    mainStatement?: string;
    informationGap?: string;
    analyticalStatement?: {
        id?: number;
        uuid: string;
        order?: number;
        statement?: string;
        analyticalEntries: {
            id?: number;
            uuid: string;
            entry: number;
            order?: number;
        }[];
    }[];
    createdAt: string;
    analysis: number;

    title: string;
    assignee: number;
    filters?: PillarFilterItem[];
}

export interface AnalysisElement {
    id: number;
    title: string;
    teamLead: number;
    teamLeadName: string;
    analysisPillar: AnalysisPillars[];
    startDate?: string;
    endDate?: string;
    createdAt: string;
}

export interface AnalysisPillarFormItem {
    key?: number;
    title?: number;
    assignee?: number;
    filters?: PillarFilterItem[];
}
