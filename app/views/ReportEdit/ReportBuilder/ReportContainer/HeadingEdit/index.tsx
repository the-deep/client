import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    SegmentInput,
    PendingMessage,
    ExpandableContainer,
    TextInput,
} from '@the-deep/deep-ui';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormObject,
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
    type HeadingContentStyleFormType,
} from '../../../schema';
import TextElementsStylesEdit from '../TextElementsStylesEdit';

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
    additionalStylingSettings?: React.ReactNode;
}

function HeadingEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
        error: riskyError,
        disabled,
        additionalStylingSettings,
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

    const onStyleChange = useFormObject<
        'style', HeadingContentStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.headingEdit)}>
            {loading && <PendingMessage />}
            <ExpandableContainer
                heading="General"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                defaultVisibility
                withoutBorder
            >
                <TextInput
                    value={value?.content}
                    name="content"
                    label="Heading"
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
                    spacing="compact"
                />
            </ExpandableContainer>
            <ExpandableContainer
                heading="Styling"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextElementsStylesEdit
                    name="h1"
                    value={value?.style?.h1}
                    onChange={onStyleChange}
                />
                {additionalStylingSettings}
            </ExpandableContainer>
        </div>
    );
}

export default HeadingEdit;
