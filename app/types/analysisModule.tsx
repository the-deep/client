interface PillarFilterItem {
    id: string;
    key: string;
    uniqueId: string;
}

interface AnalyticalStatement {
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
    versionId: number;
    assigneeDetails: {
        id: number;
        displayName: string;
    };
    analysisTitle: string;
    mainStatement?: string;
    informationGap?: string;
    analyticalStatements?: AnalyticalStatement[];
    createdAt: string;
    modifiedAt: string;
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
    id: string;
    title: string;
    createdAt: string;
    analysis: string;
    analyzedEntriesCount: number;
    entries?: {
      totalCount?: number | null | undefined;
    } | null | undefined;
    analyticalStatementCount: number;
    analyticalStatements: any[];
    assigneeDetails: any;
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
