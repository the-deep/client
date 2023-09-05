import {
    AnalysisReportBorderStyleStyleEnum,
} from '#generated/types';

import {
    type ContainerStyleFormType,
} from './schema';

const borderStyleToValueMap: Record<AnalysisReportBorderStyleStyleEnum, string> = {
    DASHED: 'dashed',
    DOTTED: 'dotted',
    SOLID: 'solid',
    NONE: 'none',
    DOUBLE: 'double',
};

// eslint-disable-next-line import/prefer-default-export
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
