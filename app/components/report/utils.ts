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

export type ContentDataFileMap = Record<string, {
    url: string | undefined;
    name: string | undefined;
}>;
