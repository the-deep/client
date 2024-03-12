import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    PurgeNull,
    useFormObject,
} from '@togglecorp/toggle-form';
import { useQuery, gql } from '@apollo/client';
import {
    Heading,
    NumberInput,
    SegmentInput,
    ColorInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import {
    AnalysisReportLineLayerStyleType,
    LineLayerStyleEnumsQuery,
} from '#generated/types';
import {
    newEnumKeySelector,
    newEnumLabelSelector,
} from '#utils/common';

import styles from './styles.css';

const LINE_LAYER_STYLE_ENUMS = gql`
    query LineLayerStyleEnums {
        enums {
            AnalysisReportLineLayerStyleSerializerStrokeType {
                description
                enum
                label
            }
        }
    }
`;

type StylesType = PurgeNull<AnalysisReportLineLayerStyleType>;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    label?: string;
    value?: StylesType | undefined;
    onChange: (
        value: SetValueArg<StylesType | undefined>,
        name: NAME,
    ) => void;
    error?: Error<AnalysisReportLineLayerStyleType>;
    disabled?: boolean;
}

function LineLayerElementStylesEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        label,
        error: riskyError,
        disabled,
        name,
        onChange,
    } = props;

    const onFieldChange = useFormObject<
        NAME, StylesType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    const {
        data: enumsData,
    } = useQuery<LineLayerStyleEnumsQuery>(
        LINE_LAYER_STYLE_ENUMS,
    );

    const strokeTypeOptions = enumsData?.enums?.AnalysisReportLineLayerStyleSerializerStrokeType;

    return (
        <div className={_cs(className, styles.lineLayerStylesEdit)}>
            {label && (
                <Heading size="extraSmall">{label}</Heading>
            )}
            <NonFieldError error={error} />
            <div className={styles.inputs}>
                <NumberInput
                    className={styles.input}
                    label="Dash Spacing"
                    value={value?.dashSpacing}
                    name="dashSpacing"
                    onChange={onFieldChange}
                    error={error?.dashSpacing}
                    disabled={disabled}
                />
                <NumberInput
                    className={styles.input}
                    label="Stroke Width"
                    value={value?.strokeWidth}
                    name="strokeWidth"
                    onChange={onFieldChange}
                    error={error?.strokeWidth}
                    disabled={disabled}
                />
                <ColorInput
                    name="stroke"
                    value={value?.stroke}
                    className={_cs(styles.colorInput)}
                    onChange={onFieldChange}
                    /* FIXME Add error, label and disabled in color input
                    error={error?.color}
                    label="Color"
                    disabled={disabled}
                    */
                />
                <SegmentInput
                    name="strokeType"
                    label="Stroke Type"
                    value={value?.strokeType}
                    onChange={onFieldChange}
                    options={strokeTypeOptions ?? []}
                    keySelector={newEnumKeySelector}
                    labelSelector={newEnumLabelSelector}
                    error={error?.strokeType}
                    disabled={disabled}
                    spacing="compact"
                />
            </div>
        </div>
    );
}

export default LineLayerElementStylesEdit;
