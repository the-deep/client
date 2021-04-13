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

export interface AnalysisPillars {
    id: number;
    assigneeName: string;
    analysisTitle: string;
    title: string;
    mainStatement?: string;
    informationGap?: string;
    createdAt: string;
    assignee: number;
    analysis: number;
    filters?: PillarFilterItem[];
}

export interface PillarFilterItem {
    id: string;
    key: string;
    uniqueId: string;
}

export interface AnalysisPillarFormItem {
    key?: number;
    title?: number;
    assignee?: number;
    filters?: PillarFilterItem[];
}

export interface PillarAnalysisElement extends AnalysisPillars {
    analysisTitle: string;
    title: string;
    filters?: PillarFilterItem[];
}
