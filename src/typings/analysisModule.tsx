import { BasicElement } from './';

export interface AnalysisElement extends BasicElement {
    title: string;
    teamLead: number;
    teamLeadName: string;
    analysisPillar: PillarAnalysisElement[];
    startDate?: string;
    endDate?: string;
    createdOn?: string;
}

export interface PillarAnalysisElement extends BasicElement {
}

export interface AnalysisPillars {
    id: number;
    analysis: number;
    analysisName: number;
    assigneeName: string;
    title: string;
    mainStatement?: string;
    informationGap?: string;
    filters?: unknown; // To be assigned a type when filters are passed from API
}
