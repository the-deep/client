type Intersects<A, B> = A extends B ? true : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type PartialForm<T, J extends string> = T extends object ? (
    T extends (infer K)[] ? (
        PartialForm<K, J>[]
    ) : (
        Intersects<J, keyof T> extends true ? (
            { [P in Exclude<keyof T, J>]?: PartialForm<T[P], J> }
            & Pick<T, keyof T & J>
        ) : (
            { [P in keyof T]?: PartialForm<T[P], J> }
        )
    )
) : T;


export type Types = 'number'
    | 'text'
    | 'single-select'
    | 'multi-select'
    | 'date'
    | 'time'
    | 'time-range'
    | 'date-range'
    | 'matrix-2d'
    | 'matrix-1d'
    | 'organigram'
    | 'scale';

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
    // NOTE: this is repeative
    /*
    type: 'number'
        | 'text'
        | 'single-select'
        | 'multi-select'
        | 'date'
        | 'time'
        | 'date-range'
        | 'matrix-2d'
        | 'matrix-1d'
        | 'organigram'
        | 'scale';
    */
    type: unknown;
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

    type: Types;
}

interface NumberWidget extends BaseWidget {
    type: 'number';
    data: NumberData;
}
export interface TextWidget extends BaseWidget {
    type: 'text';
    data: BaseData<string>;
}
interface SingleSelectWidget extends BaseWidget {
    type: 'single-select';
    data: SelectData;
}
interface MultiSelectWidget extends BaseWidget {
    type: 'multi-select';
    data: SelectData;
}
export interface DateWidget extends BaseWidget {
    type: 'date';
    data: BaseData<string>;
}
interface TimeWidget extends BaseWidget {
    type: 'time';
    data: BaseData<string>;
}
interface TimeRangeWidget extends BaseWidget {
    type: 'time-range';
    data: BaseData<string>;
}
interface DateRangeWidget extends BaseWidget {
    type: 'date-range';
    data: BaseData<string>;
}
interface Matrix1dWidget extends BaseWidget {
    type: 'matrix-1d';
    data: Matrix1dData;
}
interface Matrix2dWidget extends BaseWidget {
    type: 'matrix-2d';
    data: Matrix2Data;
}
interface OrganigramWidget extends BaseWidget {
    type: 'organigram';
    data: OrganigramData;
}
interface ScaleWidget extends BaseWidget {
    type: 'scale';
    data: ScaleData;
}

export type Widget = NumberWidget
    | TextWidget
    | SingleSelectWidget
    | MultiSelectWidget
    | DateWidget
    | TimeWidget
    | TimeRangeWidget
    | DateRangeWidget
    | Matrix1dWidget
    | Matrix2dWidget
    | OrganigramWidget
    | ScaleWidget;

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