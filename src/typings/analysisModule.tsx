export interface PillarFilterItem {
    id: string;
    key: string;
    uniqueId: string;
}

export interface AnalyticalStatement {
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
}

export interface AnalysisPillars {
    id: number;
    assigneeName: string;
    analysisTitle: string;
    mainStatement?: string;
    informationGap?: string;
    analyticalStatements?: AnalyticalStatement[];
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
    assigneeDetails: { displayName: string };
    createdAt: string;
    analyzedEntries?: number;
}

export interface AnalysisSummary {
    id: number;
    title: string;
    pillars: PillarSummary[];
    startDate?: string;
    endDate: string;
    createdAt: string;
    modifiedAt: string;
    teamLead: number;
    teamLeadDetails: {
        id: number;
        displayName: string;
    };
    totalEntries: number;
    totalSources: number;
    analyzedEntries: number;
    analyzedSources: number;
}

export interface AnalysisElement {
    id: number;
    title: string;
    teamLead: number;
    teamLeadDetails: {
        id: number;
        displayName: string;
    };
    analysisPillar: AnalysisPillars[];
    startDate?: string;
    endDate: string;
    createdAt: string;
    modifiedAt: string;
}

export interface AnalysisPillarFormItem {
    key?: number;
    title?: number;
    assignee?: number;
    filters?: PillarFilterItem[];
}
