import {
    type PurgeNull,
} from '@togglecorp/toggle-form';
import {
    listToMap,
} from '@togglecorp/fujs';

import {
    AnalysisReportBorderStyleStyleEnum,
    AnalysisReportTextStyleAlignEnum,
    AnalysisReportTextStyleType,
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
): React.CSSProperties {
    if (!containerStyle) {
        return {};
    }

    const {
        padding,
        border,
        background,
    } = containerStyle ?? {};

    return {
        backgroundColor: background?.color,
        borderWidth: border?.width,
        borderColor: border?.color,
        borderStyle: border?.style ? borderStyleToValueMap[border.style] : undefined,
        paddingTop: padding?.top,
        paddingRight: padding?.right,
        paddingBottom: padding?.bottom,
        paddingLeft: padding?.left,
    };
}

export function resolveTextStyle(
    textStyle: PurgeNull<AnalysisReportTextStyleType> | undefined,
): React.CSSProperties {
    if (!textStyle) {
        return {};
    }

    const {
        align,
        color,
        family,
        weight,
        size,
    } = textStyle ?? {};

    return {
        textAlign: align ? alignStyleToValueMap[align] : undefined,
        color,
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
    };
}

export type ContentDataFileMap = Record<string, {
    url: string | undefined;
    name: string | undefined;
}>;
