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

export interface AdminLevel {
    id: number;
    title: string;
    level: number;
    nameProp?: string;
    codeProp?: string;
    parentNameProp?: string;
    parentCodeProp?: string;
}

export interface Region {
    id: number;
    createdAt: string;
    modifiedAt: string;
    createdBy: number;
    modifiedBy: number;
    createdByName: string;
    modifiedByName: string;
    versionId: number;
    code: string;
    title: string;
    public: boolean;
    adminLevels?: AdminLevel[];
}
