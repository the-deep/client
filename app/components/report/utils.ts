import {
    type PurgeNull,
} from '@togglecorp/toggle-form';
import {
    listToMap,
    isNotDefined,
    isDefined,
    sum,
    mean,
    median,
    listToGroupList,
    mapToMap,
} from '@togglecorp/fujs';
import {
    utils,
    type WorkSheet,
} from 'xlsx';

import {
    AnalysisReportBorderStyleStyleEnum,
    AnalysisReportTextStyleAlignEnum,
    AnalysisReportTextStyleType,
    AnalysisReportVariableTypeEnum,
    AnalysisReportAggregationTypeEnum,
    AnalysisReportGridLineStyleType,
    AnalysisReportTickStyleType,
} from '#generated/types';

import {
    type ContainerStyleFormType,
} from './schema';

export const defaultFont = 'Source Sans Pro';
export const supportedFonts = [
    {
        name: 'Source Sans Pro',
        weights: [300, 400, 600],
    },
    {
        name: 'Roboto',
        weights: [300, 400, 500, 700],
    },
];

export const fontWeightMap = listToMap(
    supportedFonts,
    (item) => item.name,
    (item) => item.weights.map((weight) => ({ weight })),
);

const borderStyleToValueMap: Record<AnalysisReportBorderStyleStyleEnum, string> = {
    DASHED: 'dashed',
    DOTTED: 'dotted',
    SOLID: 'solid',
    NONE: 'none',
    DOUBLE: 'double',
};

const alignStyleToValueMap: Record<
    AnalysisReportTextStyleAlignEnum,
    'left' | 'right' | 'center' | 'justify'
> = {
    START: 'left',
    END: 'right',
    CENTER: 'center',
    JUSTIFIED: 'justify',
};

export function resolveContainerStyle(
    containerStyle: ContainerStyleFormType | undefined,
    generalContainerStyle: ContainerStyleFormType | undefined,
): React.CSSProperties {
    if (!containerStyle && !generalContainerStyle) {
        return {};
    }

    const {
        padding,
        border,
        background,
    } = containerStyle ?? {};

    const {
        padding: generalPadding,
        border: generalBorder,
        background: generalBackground,
    } = generalContainerStyle ?? {};

    const borderStyle = border?.style ? borderStyleToValueMap[border.style] : undefined;
    const generalBorderStyle = generalBorder?.style
        ? borderStyleToValueMap[generalBorder.style] : undefined;

    return {
        backgroundColor: background?.color ?? generalBackground?.color,
        borderWidth: border?.width ?? generalBorder?.width,
        borderColor: border?.color ?? generalBorder?.color,
        borderStyle: borderStyle ?? generalBorderStyle,
        paddingTop: padding?.top ?? generalPadding?.top,
        paddingRight: padding?.right ?? generalPadding?.right,
        paddingBottom: padding?.bottom ?? generalPadding?.bottom,
        paddingLeft: padding?.left ?? generalPadding?.bottom,
    };
}

export function resolveTextStyle(
    textStyle: PurgeNull<AnalysisReportTextStyleType> | undefined,
    generalTextStyle: PurgeNull<AnalysisReportTextStyleType> | undefined,
): React.CSSProperties {
    if (!textStyle && !generalTextStyle) {
        return {};
    }

    const {
        align,
        color,
        family,
        weight,
        size,
    } = textStyle ?? {};

    const {
        align: generalAlign,
        color: generalColor,
        family: generalFamily,
        weight: generalWeight,
        size: generalSize,
    } = generalTextStyle ?? {};

    const textAlign = align ? alignStyleToValueMap[align] : undefined;
    const generalTextAlign = generalAlign ? alignStyleToValueMap[generalAlign] : undefined;

    return {
        textAlign: textAlign ?? generalTextAlign,
        color: color ?? generalColor,
        fontFamily: family ?? generalFamily,
        fontWeight: weight ?? generalWeight,
        fontSize: size ?? generalSize,
    };
}

export function resolveLineStyle(
    lineStyle: (
        PurgeNull<AnalysisReportTickStyleType>
        | PurgeNull<AnalysisReportGridLineStyleType> | undefined
    ),
    generalLineStyle: (
        PurgeNull<AnalysisReportTickStyleType>
        | PurgeNull<AnalysisReportGridLineStyleType> | undefined
    ),
): React.CSSProperties {
    if (!lineStyle && !generalLineStyle) {
        return {};
    }

    const {
        lineWidth,
        lineColor,
    } = lineStyle ?? {};

    const {
        lineWidth: generalLineWidth,
        lineColor: generalLineColor,
    } = generalLineStyle ?? {};

    return {
        stroke: lineColor ?? generalLineColor ?? 'lightgray',
        strokeWidth: lineWidth ?? generalLineWidth,
    };
}

export function aggregate<T>(
    data: T[] | undefined,
    xSelector: (data: T) => unknown,
    ySelector: (data: T) => unknown,
    aggregator: AnalysisReportAggregationTypeEnum = 'COUNT',
): { key: string, value: number | undefined }[] | undefined {
    if (isNotDefined(data)) {
        return undefined;
    }

    const xValues = data.map(
        (item) => {
            const xValue = xSelector(item);

            if (isNotDefined(xValue)) {
                return undefined;
            }

            return {
                x: String(xValue),
                originalData: item,
            };
        },
    ).filter(isDefined);

    const dataGroupedByX = listToGroupList(
        xValues,
        (item) => item.x,
        (item) => ySelector(item.originalData),
    );

    return Object.keys(dataGroupedByX).map((item) => {
        let aggregatedValue;

        const cleanData: number[] = dataGroupedByX[item].map((unsafeItem) => {
            const convertedNumber = unsafeItem === '' ? NaN : Number(unsafeItem);
            if (!Number.isNaN(convertedNumber)) {
                return Number(unsafeItem);
            }

            return undefined;
        }).filter(isDefined);

        if (cleanData.length === 0) {
            return undefined;
        }

        if (aggregator === 'SUM') {
            aggregatedValue = sum(cleanData);
        } else if (aggregator === 'MEAN') {
            aggregatedValue = mean(cleanData);
        } else if (aggregator === 'MEDIAN') {
            aggregatedValue = median(cleanData);
        } else if (aggregator === 'MIN') {
            aggregatedValue = Math.min(...cleanData);
        } else if (aggregator === 'MAX') {
            aggregatedValue = Math.max(...cleanData);
        } else if (aggregator === 'COUNT') {
            aggregatedValue = dataGroupedByX[item].length;
        }

        if (isNotDefined(aggregatedValue)) {
            return undefined;
        }

        return {
            key: item,
            value: aggregatedValue,
        };
    }).filter(isDefined);
}

type DataTypeCountType = Record<AnalysisReportVariableTypeEnum | 'UNDEFINED', number>;

// TODO: Write tests
export function categorizeData(
    data: Record<string, unknown>[],
    key: string,
): DataTypeCountType {
    const selectedData = data.map((item) => item[key]);

    const x = selectedData.reduce((acc: DataTypeCountType, item: unknown) => {
        const convertedNumber = item === '' ? NaN : Number(item);

        if (
            typeof item === 'number'
            || !Number.isNaN(convertedNumber)
        ) {
            return {
                ...acc,
                NUMBER: acc.NUMBER + 1,
            };
        }
        if (
            typeof item === 'string' && !Number.isNaN(new Date(item).getTime())
        ) {
            return {
                ...acc,
                DATE: acc.DATE + 1,
            };
        }
        if (
            typeof item === 'string' && (item.toLowerCase() === 'true' || item.toLowerCase() === 'false')
        ) {
            return {
                ...acc,
                BOOLEAN: acc.BOOLEAN + 1,
            };
        }
        if (
            typeof item === 'string'
        ) {
            return {
                ...acc,
                TEXT: acc.TEXT + 1,
            };
        }
        if (
            typeof item === 'undefined' || item === null
        ) {
            return {
                ...acc,
                UNDEFINED: acc.UNDEFINED + 1,
            };
        }

        return acc;
    }, {
        TEXT: 0,
        NUMBER: 0,
        UNDEFINED: 0,
        BOOLEAN: 0,
        DATE: 0,
    } as DataTypeCountType);

    return x;
}

// TODO: Write tests
export function getColumnType(
    counts: DataTypeCountType,
): AnalysisReportVariableTypeEnum {
    const withoutUndefined = {
        TEXT: counts.TEXT,
        NUMBER: counts.NUMBER,
        BOOLEAN: counts.BOOLEAN,
        DATE: counts.DATE,
    };
    const maxCount = Math.max(...Object.values(withoutUndefined));
    const typeByCount = mapToMap(
        withoutUndefined,
        (_, value) => value,
        (_, key) => key as unknown as AnalysisReportVariableTypeEnum,
    );

    return typeByCount[maxCount];
}

// TODO: Write tests
export function getCompleteness(
    counts: DataTypeCountType,
    type: AnalysisReportVariableTypeEnum,
): number {
    const dataLength = Math.max(...Object.values(counts));
    const typeCount = counts[type];
    return (typeCount / dataLength) * 100;
}

// TODO: Write tests
export function getColumnsFromWorkSheet(
    workSheet: WorkSheet,
    headerRow: number,
): string[] {
    const rawData = utils.sheet_to_json(workSheet, { header: 1 });

    const rawColumns = (rawData[headerRow - 1] as unknown[]);
    return (new Array(rawColumns.length).fill(undefined)).map(
        (_: unknown, columnIndex: number) => (
            rawColumns[columnIndex] ? String(rawColumns[columnIndex]) : `Column ${columnIndex + 1}`
        ),
    );
}

// TODO: Write tests
export function getRawDataForWorkSheet(
    workSheet: WorkSheet,
    columns: string[],
    headerRow: number,
): Record<string, unknown>[] {
    const rawData = utils.sheet_to_json(workSheet, { header: 1 });

    rawData.splice(0, headerRow);

    return (rawData as unknown[][]).map((rawDataItem) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((column, columnIndex) => {
            obj[column] = rawDataItem[columnIndex];
        });
        return obj;
    });
}
