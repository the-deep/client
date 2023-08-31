import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    SegmentInput,
    PendingMessage,
    TextInput,
} from '@the-deep/deep-ui';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { useQuery, gql } from '@apollo/client';

import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    AnalysisReportHeadingConfigurationVariantEnum,
    ReportHeadingDetailsQuery,
} from '#generated/types';
import { EnumOptions } from '#types/common';

import {
    type HeadingConfigType,
} from '../../../schema';

import styles from './styles.css';

const REPORT_HEADING = gql`
    query ReportHeadingDetails {
        headingVariants: __type(name: "AnalysisReportHeadingConfigurationVariantEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

interface Props {
    className?: string;
    value: HeadingConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<HeadingConfigType>) => void;
    error?: Error<HeadingConfigType>;
    disabled?: boolean;
}

function HeadingEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const {
        loading,
        data,
    } = useQuery<ReportHeadingDetailsQuery>(
        REPORT_HEADING,
    );

    const options = data?.headingVariants?.enumValues as EnumOptions<
        AnalysisReportHeadingConfigurationVariantEnum
    >;

    return (
        <div className={_cs(className, styles.headingEdit)}>
            {loading && <PendingMessage />}
            <div className={styles.left}>
                <TextInput
                    value={value?.content}
                    name="content"
                    onChange={onFieldChange}
                    error={error?.content}
                    disabled={disabled}
                />
                <SegmentInput
                    name="variant"
                    label="Variant"
                    value={value?.variant}
                    onChange={onFieldChange}
                    options={options ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    className={styles.input}
                    error={error?.variant}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default HeadingEdit;
