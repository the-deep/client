export interface PublishedDateCount {
    count: number;
    date: string;
}

export interface ConnectorSource {
    key: number;
    title: string;
}

export interface ConnectorSourceInstance extends ConnectorSource {
    noOfLeads?: number;
    broken?: boolean;
    publishedDates: PublishedDateCount[];
}

export interface Connector {
    id: number;
    title: string;
    sources: ConnectorSourceInstance[];
    updatedOn: string;
    disabled: boolean;
}

