import React, { useCallback } from 'react';
import { ExpandableContainer, ListView } from '@the-deep/deep-ui';
import { EntriesAsList, Error, getErrorObject, useFormArray } from '@togglecorp/toggle-form';

import { AssessmentRegistrySectorTypeEnum } from '#generated/types';

import SubDimensionItem, { Props as SubDimensionItemProps } from './SubDimensionItem';
import { DimensionType } from '..';
import SummaryDimensionMetaInput from './SummaryDimensionMetaInput';
import { PartialFormType, SubDimensionMetaInputType, SummaryIssueType } from '../../formSchema';

import styles from './styles.css';

export interface Props {
    value: PartialFormType;
    data: DimensionType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    error: Error<PartialFormType>;
    sector: AssessmentRegistrySectorTypeEnum;
    disabled?: boolean;
}

const keySelector = (d: NonNullable<
    DimensionType['subDimensionInformation']
>[number]) => d.subDimension;

function DimensionItem(props: Props) {
    const {
        value,
        data,
        disabled,
        error: riskError,
        setFieldValue,
        issuesOptions,
        setIssuesOptions,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
        sector,
    } = props;

    const error = getErrorObject(riskError);
    const subDimensionParams = useCallback(
        (name: string, subDimensionData): SubDimensionItemProps => ({
            data: subDimensionData,
            name,
            value: value.summarySubDimensionIssue,
            onChange: setFieldValue,
            issuesOptions,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            setIssuesOptions,
            disabled,
            error: error?.summarySubDimensionIssue,
            dimension: data.dimension,
        }),
        [
            value,
            setFieldValue,
            issuesOptions,
            setIssuesOptions,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            disabled,
            error,
            data.dimension,
        ],
    );

    const {
        setValue: onChangeDimensionMeta,
    } = useFormArray<'summaryDimensionMeta', SubDimensionMetaInputType>(
        'summaryDimensionMeta', setFieldValue,
    );

    return (
        <div className={styles.dimension}>
            <ExpandableContainer
                className={styles.expandableContainer}
                heading={data.dimensionDisplay}
                headingSize="extraSmall"
                withoutBorder
                headerActions={(
                    <SummaryDimensionMetaInput
                        name={+sector}
                        value={undefined}
                        onChange={onChangeDimensionMeta}
                        error={error?.summaryDimensionMeta}
                        sector={sector}
                        dimension={data.dimension}
                    />
                )}
                expansionTriggerArea="arrow"
            >
                <ListView
                    className={styles.subDimensionItem}
                    data={data.subDimensionInformation}
                    keySelector={keySelector}
                    renderer={SubDimensionItem}
                    rendererParams={subDimensionParams}
                    errored={false}
                    filtered={false}
                    pending={false}
                    messageShown
                    messageIconShown
                />
            </ExpandableContainer>

        </div>
    );
}

export default DimensionItem;
