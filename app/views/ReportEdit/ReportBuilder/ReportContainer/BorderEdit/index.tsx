import React from 'react';
import {
    type SetValueArg,
    type Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    NumberInput,
    PendingMessage,
    SegmentInput,
    ColorInput,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    AnalysisReportBorderStyleStyleEnum,
    ReportBorderDetailsQuery,
} from '#generated/types';
import { EnumOptions } from '#types/common';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    type BorderStyleFormType,
} from '../../../schema';

import styles from './styles.css';

const REPORT_BORDER = gql`
    query ReportBorderDetails {
        borderVariants: __type(name: "AnalysisReportBorderStyleStyleEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

interface Props<NAME extends string> {
    name: NAME;
    value: BorderStyleFormType | undefined;
    onChange: (value: SetValueArg<BorderStyleFormType | undefined>, name: NAME) => void;
    error?: Error<BorderStyleFormType>;
    disabled?: boolean;
}

function BorderEdit<NAME extends string>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);
    const onFieldChange = useFormObject<
        NAME, BorderStyleFormType
    >(name, onChange, {});

    const {
        loading,
        data,
    } = useQuery<ReportBorderDetailsQuery>(
        REPORT_BORDER,
    );

    const options = data?.borderVariants?.enumValues as EnumOptions<
        AnalysisReportBorderStyleStyleEnum
    >;

    return (
        <>
            {loading && <PendingMessage />}
            <ColorInput
                name="color"
                value={value?.color}
                className={styles.colorInput}
                onChange={onFieldChange}
                /* FIXME Add error, label and disabled in color input
                error={error?.color}
                label="Color"
                disabled={disabled}
                */
            />
            <NumberInput
                name="width"
                label="Width"
                value={value?.width}
                onChange={onFieldChange}
                error={error?.width}
                disabled={disabled}
            />
            <NumberInput
                name="opacity"
                label="Opacity"
                value={value?.opacity}
                onChange={onFieldChange}
                error={error?.opacity}
                disabled={disabled}
            />
            <SegmentInput
                name="style"
                label="Variant"
                value={value?.style}
                onChange={onFieldChange}
                options={options ?? undefined}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                error={error?.style}
                disabled={disabled}
                spacing="compact"
            />
        </>
    );
}

export default BorderEdit;
