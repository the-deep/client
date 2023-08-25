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
    dimensionIssueToClienIdMap: Record<string, string>;
    setDimensionIssueToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    dimensionIssuesOptions?: SummaryIssueType[] | null;
    setDimensionIssuesOptions: React.Dispatch<React.SetStateAction<
    SummaryIssueType[]
    | undefined
    | null
    >>;
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
        dimensionIssuesOptions,
        setDimensionIssuesOptions,
        dimensionIssueToClienIdMap,
        setDimensionIssueToClientIdMap,
        sector,
    } = props;

    const error = getErrorObject(riskError);
    const subDimensionParams = useCallback(
        (name: string, subDimensionData): SubDimensionItemProps => ({
            data: subDimensionData,
            name,
            sector,
            value: value.summarySubDimensionIssue,
            onChange: setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClienIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error: error?.summarySubDimensionIssue,
        }),
        [
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClienIdMap,
            setDimensionIssueToClientIdMap,
            sector,
            disabled,
            error,
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
                headingContainerClassName={styles.headingContainer}
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
