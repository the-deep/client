interface BasicEntity {
    id: number;
    createdAt: string;
    createdBy: number;
    createdByName: string;
}
interface KeyLabel {
    key: string;
    label: string;
    tooltip?: string;
}
interface KeyLabelColor extends KeyLabel {
    color: string;
}

interface Condition {
    clientId: string;
    // NOTE: this is repetative
    type: 'number' | 'text' | 'single-select' | 'multi-select' | 'date' | 'time' | 'date-range' | 'matrix-2d' | 'matrix-1d' | 'organigram' | 'scale';
    directive: unknown;

    order: number;
    conjunction: 'XOR' | 'OR' | 'AND' | 'NOR' | 'NAND' | 'NXOR';
}

interface BaseData<T> {
    defaultValue?: T;
}
interface NumberData extends BaseData<number> {
    maxValue?: number;
    minValue?: number;
}
interface SelectData extends BaseData<string> {
    options: KeyLabel[];
}
interface ScaleData extends BaseData<string> {
    options: KeyLabelColor[];
}
interface OrganigramData extends BaseData<string> {
    options: unknown;
}

interface Matrix1dRows extends KeyLabelColor {
    cells: KeyLabel[]
}
interface Matrix1dData extends BaseData<string[]> {
    rows: Matrix1dRows[]
}

interface Matrix2dRows extends KeyLabelColor {
    subRows: KeyLabel[]
}
interface Matrix2dColumns extends KeyLabel {
    subColumns: KeyLabel[]
}

interface Matrix2Data extends BaseData<string[]> {
    rows: Matrix2dRows[];
    columns: Matrix2dColumns[];
}

interface BaseWidget {
    clientId: string;
    title: string;
    order: number;

    width: 'full' | 'half';

    parent?: string;
    condition: Condition[];
}
type Widget = BaseWidget & ({
    type: 'number';
    data: NumberData;
} | {
    type: 'text';
    data: BaseData<string>;
} | {
    type: 'single-select';
    data: SelectData;
} | {
    type: 'multi-select';
    data: SelectData;
} | {
    type: 'date';
    data: BaseData<string>;
} | {
    type: 'time';
    data: BaseData<string>;
} | {
    type: 'time-range';
    data: BaseData<string>;
} | {
    type: 'date-range';
    data: BaseData<string>;
} | {
    type: 'matrix-2d';
    data: Matrix2Data;
} | {
    type: 'matrix-1d';
    data: Matrix1dData;
} | {
    type: 'organigram';
    data: OrganigramData;
} | {
    type: 'scale';
    data: ScaleData;
});

export interface Section {
    clientId: string;
    title: string;
    widgets: Widget[];
}

export interface AnalysisFramework extends BasicEntity {
    title: string;
    members: number[];
    referenceImage?: string;

    isPrivate?: boolean;

    description?: string;

    organization?: number;
    organizationDetails?: {
        id: number;
        title: string;
        shortName: string;
    };

    primaryTagging: Widget[];
    secondaryTagging: Section[];
}
