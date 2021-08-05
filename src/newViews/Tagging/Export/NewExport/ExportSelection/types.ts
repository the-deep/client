interface DateValue {
    startDate: string;
    endDate: string;
}

interface TimeValue {
    startTime: string;
    endTime: string;
}
export interface EntryFilterType {
    [key: string]: string |
        string[] | EntryFilterType | boolean | undefined | DateValue | TimeValue;
}

export interface SourceEntryFilter {
    createdAt?: {
        startDate: string;
        endDate: string;
    };
    publishedOn?: {
        startDate: string;
        endDate: string;
    };
    assignee?: string[];
    status?: string[];
    search?: string;
    exists?: string;
    priority?: string[];
    authoringOrganizationTypes?: string[];
    confidentiality?: string[];
    emmRiskFactors?: string[];
    emmKeywords?: string[];
    emmEntities?: string[];
    entriesFilter?: EntryFilterType;
}

export interface Node {
    selected: boolean;
    key: string;
    title: string;
    nodes: Node[] | undefined;
}

export interface TreeSelectableWidget<T extends string | number> extends Node {
    id: T;
    actualTitle?: string;
    conditionalId?: number;
    isConditional?: boolean;
}
