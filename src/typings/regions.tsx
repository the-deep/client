export interface GeoOption {
    adminLevel: number;
    adminLevelTitle: string;
    key: string;
    label: string;
    parent?: number;
    region: number;
    regionTitle: string;
    title: string;
}

export interface GeoOptions {
    [regionKey: string]: GeoOption[];
}
