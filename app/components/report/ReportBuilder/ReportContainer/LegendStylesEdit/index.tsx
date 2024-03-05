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
    PendingMessage,
    SegmentInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import {
    LegendStyleEnumsQuery,
    AnalysisReportCategoricalLegendStyleType,
} from '#generated/types';
import {
    newEnumKeySelector,
    newEnumLabelSelector,
} from '#utils/common';

import TextElementsStylesEdit from '../TextElementsStylesEdit';
import styles from './styles.css';

const LEGEND_STYLE_ENUMS = gql`
    query LegendStyleEnums {
        enums {
            AnalysisReportCategoricalLegendStyleSerializerPosition {
                description
                enum
                label
            }
            AnalysisReportCategoricalLegendStyleSerializerShape {
                description
                enum
                label
            }
        }
    }
`;

type StylesType = PurgeNull<AnalysisReportCategoricalLegendStyleType>;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    label?: string;
    value?: StylesType | undefined;
    onChange: (
        value: SetValueArg<StylesType | undefined>,
        name: NAME,
    ) => void;
    error?: Error<AnalysisReportCategoricalLegendStyleType>;
    disabled?: boolean;
}

function LegendElementStylesEdit<NAME extends string>(props: Props<NAME>) {
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
        loading,
    } = useQuery<LegendStyleEnumsQuery>(
        LEGEND_STYLE_ENUMS,
    );
    const positionOptions = enumsData
        ?.enums?.AnalysisReportCategoricalLegendStyleSerializerPosition;
    const shapeOptions = enumsData
        ?.enums?.AnalysisReportCategoricalLegendStyleSerializerShape;

    return (
        <div className={_cs(className, styles.legendElementsStylesEdit)}>
            {loading && <PendingMessage />}
            {label && (
                <Heading size="extraSmall">{label}</Heading>
            )}
            <NonFieldError error={error} />
            <div className={styles.inputs}>
                <SegmentInput
                    name="position"
                    label="Position"
                    value={value?.position}
                    className={_cs(styles.input, styles.selectInput)}
                    onChange={onFieldChange}
                    options={positionOptions ?? undefined}
                    keySelector={newEnumKeySelector}
                    labelSelector={newEnumLabelSelector}
                    error={error?.position}
                    disabled={disabled}
                />
                <SegmentInput
                    name="shape"
                    label="Shape"
                    value={value?.shape}
                    className={_cs(styles.input, styles.selectInput)}
                    onChange={onFieldChange}
                    options={shapeOptions ?? undefined}
                    keySelector={newEnumKeySelector}
                    labelSelector={newEnumLabelSelector}
                    error={error?.shape}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="heading"
                    label="Legend Heading"
                    value={value?.heading}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="label"
                    label="Legend Label"
                    value={value?.label}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default LegendElementStylesEdit;
