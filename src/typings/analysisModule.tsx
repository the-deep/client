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
}

export interface PillarAnalysisElement extends AnalysisPillars{
    analysisName: string;
    title: string;
    filters?: unknown;
}
