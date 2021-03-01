import { BasicElement } from './';

export interface AnalysisElement extends BasicElement {
<<<<<<< HEAD
    title: string;
    teamLead: number;
    teamLeadName: string;
    analysisPillar: PillarAnalysisElement[];
    startDate?: string;
    endDate?: string;
    createdOn?: string;
=======
>>>>>>> bc57cab00 (Feature/analysis module setup 2 (#1399))
}

export interface PillarAnalysisElement extends BasicElement {
}
<<<<<<< HEAD

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
=======
>>>>>>> bc57cab00 (Feature/analysis module setup 2 (#1399))
