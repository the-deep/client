import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    SegmentInput,
    PendingMessage,
    ExpandableContainer,
    TextInput,
} from '@the-deep/deep-ui';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import { useQuery, gql } from '@apollo/client';

import NonFieldError from '#components/NonFieldError';
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
    type TextContentStyleFormType,
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

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: HeadingConfigType | undefined;
    onChange: (value: SetValueArg<HeadingConfigType | undefined>, name: NAME) => void;
    error?: Error<HeadingConfigType>;
    disabled?: boolean;
}

function HeadingEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, HeadingConfigType
    >(name, onChange, {});

    const {
        loading,
        data,
    } = useQuery<ReportHeadingDetailsQuery>(
        REPORT_HEADING,
    );

    const generalFieldMap: (keyof NonNullable<typeof error>)[] = [
        'content',
        'variant',
    ];

    const generalHasError = generalFieldMap.some(
        (key) => analyzeErrors(error?.[key]),
    );

    const options = data?.headingVariants?.enumValues as EnumOptions<
        AnalysisReportHeadingConfigurationVariantEnum
    >;

    const onStyleChange = useFormObject<
        'style', TextContentStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.headingEdit)}>
            {loading && <PendingMessage />}
            <NonFieldError error={error} />
            <ExpandableContainer
                heading={generalHasError ? 'General *' : 'General'}
                headingClassName={styles.heading}
                headingSize="small"
                spacing="compact"
                errored={generalHasError}
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
                    name="content"
                    value={value?.style?.content}
                    onChange={onStyleChange}
                />
            </ExpandableContainer>
        </div>
    );
}

export default HeadingEdit;
