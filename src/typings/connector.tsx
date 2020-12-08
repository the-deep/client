import { KeyValueElement } from './index';

export interface PublishedDateCount {
    count: number;
    date: string;
}

export type FieldType = 'string' | 'number' | 'url' | 'select' | 'date';
export type ConnectorSourceStatus = 'not_processed' | 'processing' | 'success' | 'failure';

export interface ConnectorSourceParams {
    [key: string]: string | number;
}

export interface ConnectorSourceFaramInstance {
    id?: number;
    source: string;
    params: ConnectorSourceParams;
}

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
    publishedDates: PublishedDateCount[];
}

export interface UnifiedConnectorSourceInstance extends UnifiedConnectorSource {
    statistics?: ConnectorSourceStatistics;
    totalLeads?: number;
    logo?: string;
    status?: ConnectorSourceStatus;
    lastCalculatedAt?: string;
    params: ConnectorSourceParams;
    source: string;
}

export interface Connector {
    id: number;
    title: string;
    sources: UnifiedConnectorSourceInstance[];
    isActive: boolean;
}

