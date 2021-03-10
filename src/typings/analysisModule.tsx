import { BasicElement } from './';

export interface AnalysisElement extends BasicElement {
}

export interface PillarAnalysisElement extends BasicElement {
}

export interface AnalysisPillars {
    id: number;
    analysis: number;
    assigneeName: string;
    title: string;
    mainStatement?: string;
    informationGap?: string;
    filters?: unknown; // To be assigned a type when filters are passed from API
}
