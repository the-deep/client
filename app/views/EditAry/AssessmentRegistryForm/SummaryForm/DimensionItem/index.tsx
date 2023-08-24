import React, { useCallback } from 'react';
import { ExpandableContainer, ListView } from '@the-deep/deep-ui';
import { EntriesAsList, Error, getErrorObject, useFormArray } from '@togglecorp/toggle-form';

import SubDimensionItem from './SubDimensionItem';
import { PartialFormType, SubDimensionMetaInputType, SummaryIssueType } from '../../formSchema';
import { DimensionType } from '..';
import SummaryDimensionMetaInput from './SummaryDimensionMetaInput';

import styles from './styles.css';
import { AssessmentRegistrySectorTypeEnum } from '#generated/types';

interface Props {
    value: PartialFormType;
    data: DimensionType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    error: Error<PartialFormType>;
    focus: AssessmentRegistrySectorTypeEnum;
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
        focus,
    } = props;

    const error = getErrorObject(riskError);
    const subDimensionParams = useCallback(
        (name: string, subDimensionData) => ({
            data: subDimensionData,
            name,
            issuesOptions,
            setIssuesOptions,
            disabled,
        }),
        [
            issuesOptions,
            setIssuesOptions,
            disabled,
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
                        name={+focus}
                        value={undefined}
                        onChange={onChangeDimensionMeta}
                        error={error?.summaryDimensionMeta}
                        focus={focus}
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
