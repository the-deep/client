import { KeyValueElement } from './index';

export interface PublishedDateCount {
    count: number;
    date: string;
}

export type FieldType = 'string' | 'number' | 'url' | 'select' | 'date';
export type ConnectorSourceStatus = 'processing' | 'success' | 'failure';

export interface ConnectorSourceOption {
    key: string;
    title: string;
    fieldType: FieldType;
    options: KeyValueElement[];
}

export interface ConnectorSource {
    key: string;
    title: string;
    status: 'working' | 'broken';
    options: ConnectorSourceOption[];
}

export interface UnifiedConnectorSource {
    source: string;
    title: string;
}

export interface ConnectorSourceStatistics {
    noOfLeads?: number;
    publishedDates: PublishedDateCount[];
}

export interface UnifiedConnectorSourceInstance extends UnifiedConnectorSource {
    statistics?: ConnectorSourceStatistics;
    status?: ConnectorSourceStatus;
    lastCalculatedAt?: string;
    params: Record<string, unknown>;
    source: string;
}

export interface Connector {
    id: number;
    title: string;
    sources: UnifiedConnectorSourceInstance[];
    updatedOn: string;
    disabled: boolean;
}

