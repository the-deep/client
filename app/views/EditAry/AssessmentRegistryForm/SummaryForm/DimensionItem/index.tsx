import React, { useMemo, useCallback } from 'react';
import { ExpandableContainer, ListView } from '@the-deep/deep-ui';
import { isDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

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
    dimensionIssueToClientIdMap: Record<string, string>;
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
        dimensionIssueToClientIdMap,
        setDimensionIssueToClientIdMap,
        sector,
    } = props;

    const error = getErrorObject(riskError);

    const subDimensionParams = useCallback(
        (
            name: string,
            subDimensionData: NonNullable<DimensionType['subDimensionInformation']>[number],
        ): SubDimensionItemProps => ({
            data: subDimensionData,
            name,
            sector,
            value: value.summarySubDimensionIssue,
            onChange: setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClientIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error: error?.summarySubDimensionIssue,
        }),
        [
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClientIdMap,
            setDimensionIssueToClientIdMap,
            sector,
            disabled,
            error,
        ],
    );

    const selectedMetaIndex = useMemo(() => (
        value?.summaryDimensionMeta?.findIndex((item) => item.sector === sector)
    ), [
        value?.summaryDimensionMeta,
        sector,
    ]);

    const selectedMeta = isDefined(selectedMetaIndex)
        ? value?.summaryDimensionMeta?.[selectedMetaIndex] : undefined;

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
                        name={selectedMetaIndex === -1 ? undefined : selectedMetaIndex}
                        value={selectedMeta}
                        onChange={onChangeDimensionMeta}
                        error={selectedMeta?.clientId
                            ? getErrorObject(error?.summaryDimensionMeta)?.[selectedMeta?.clientId]
                            : undefined}
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
