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
    analyticalStatements?: {
        id?: number;
        clientId: string;
        order?: number;
        statement?: string;
        includeInReport?: boolean;
        analyticalEntries: {
            id?: number;
            clientId: string;
            entry: number;
            order?: number;
        }[];
    }[];
    createdAt: string;
    modifiedAt: string;
    versionId: number;
    analysis: number;

    title: string;
    assignee: number;
    filters?: PillarFilterItem[];
}

export interface AnalyticalStatementSummary {
    id: number;
    statement: string;
    entriesCount: number;
}

export interface PillarSummary {
    id: number;
    pillarTitle: string;
    analyticalStatementCount: number;
    analyticalStatements: AnalyticalStatementSummary[];
    assignee: string;
    createdAt: string;
    entriesAnalyzed?: number;
}

export interface AnalysisSummary {
    id: number;
    title: string;
    pillarSummary: PillarSummary[];
    frameworkOverview: {
        id: number;
        title: string;
        entriesAnalyzed: number;
    }[];
    publicationDate?: {
        startDate?: string;
        endDate?: string;
    };
    createdAt: string;
    modifiedAt: string;
    teamLead: number;
    teamLeadName: string;
    totalEntries: number;
    totalSources: number;
    analyzedEntries: number;
    analyzedSources: number;
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
    modifiedAt: string;
}

export interface AnalysisPillarFormItem {
    key?: number;
    title?: number;
    assignee?: number;
    filters?: PillarFilterItem[];
}
