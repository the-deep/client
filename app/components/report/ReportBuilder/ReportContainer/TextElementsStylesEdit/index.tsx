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
    NumberInput,
    SelectInput,
    ColorInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import {
    AnalysisReportTextStyleType,
    AnalysisReportTextStyleAlignEnum,
    ReportTextAlignDetailsQuery,
} from '#generated/types';
import { EnumOptions } from '#types/common';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';

import {
    supportedFonts,
    fontWeightMap,
    defaultFont,
} from '../../../utils';

import styles from './styles.css';

const REPORT_TEXT_ALIGN = gql`
    query ReportTextAlignDetails {
        textAlignVariants: __type(name: "AnalysisReportTextStyleAlignEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

const fontKeySelector = (item: { name: string }) => item.name;
const fontLabelSelector = (item: { name: string }) => item.name;

const weightKeySelector = (item: { weight: number }) => item.weight;
const weightLabelSelector = (item: { weight: number }) => String(item.weight);

type StylesType = PurgeNull<AnalysisReportTextStyleType>;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    label?: string;
    value?: StylesType | undefined;
    onChange: (
        value: SetValueArg<StylesType | undefined>,
        name: NAME,
    ) => void;
    error?: Error<AnalysisReportTextStyleType>;
    disabled?: boolean;
}

function TextElementStylesEdit<NAME extends string>(props: Props<NAME>) {
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
    const weightOptions = fontWeightMap[value?.family ?? defaultFont];

    const {
        loading,
        data,
    } = useQuery<ReportTextAlignDetailsQuery>(
        REPORT_TEXT_ALIGN,
    );

    const options = data?.textAlignVariants?.enumValues as EnumOptions<
        AnalysisReportTextStyleAlignEnum
    >;

    return (
        <div className={_cs(className, styles.textElementsStylesEdit)}>
            {loading && <PendingMessage />}
            {label && (
                <Heading size="extraSmall">{label}</Heading>
            )}
            <NonFieldError error={error} />
            <div className={styles.inputs}>
                <NumberInput
                    className={styles.input}
                    label="Size"
                    value={value?.size}
                    name="size"
                    onChange={onFieldChange}
                    error={error?.size}
                    disabled={disabled}
                />
                <SelectInput
                    name="family"
                    label="Font Family"
                    onChange={onFieldChange}
                    value={value?.family}
                    className={styles.input}
                    options={supportedFonts}
                    keySelector={fontKeySelector}
                    labelSelector={fontLabelSelector}
                />
                <SelectInput
                    name="weight"
                    label="Font Weight"
                    onChange={onFieldChange}
                    value={value?.weight}
                    className={styles.input}
                    options={weightOptions}
                    keySelector={weightKeySelector}
                    labelSelector={weightLabelSelector}
                />
                <ColorInput
                    name="color"
                    value={value?.color}
                    className={_cs(styles.colorInput, styles.input)}
                    onChange={onFieldChange}
                    /* FIXME Add error, label and disabled in color input
                    error={error?.color}
                    label="Color"
                    disabled={disabled}
                    */
                />
                <SelectInput
                    name="align"
                    label="Align"
                    value={value?.align}
                    className={_cs(styles.input, styles.selectInput)}
                    onChange={onFieldChange}
                    options={options ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={error?.align}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default TextElementStylesEdit;
