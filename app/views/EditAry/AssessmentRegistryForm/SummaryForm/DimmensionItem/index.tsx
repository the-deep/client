import React, { useCallback } from 'react';
import { ExpandableContainer, ListView } from '@the-deep/deep-ui';
import { EntriesAsList, Error, getErrorObject, useFormArray } from '@togglecorp/toggle-form';

import SubDimmensionItem from './SubDimmensionItem';
import { PartialFormType, SubDimensionMetaInputType, SummaryIssueType } from '../../formSchema';
import { DimmensionType } from '..';
import SummaryDimensionMetaInput from './SummaryDimensionMetaInput';

import styles from './styles.css';
import { AssessmentRegistrySectorTypeEnum } from '#generated/types';

interface Props {
    value: PartialFormType;
    data: DimmensionType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    error: Error<PartialFormType>;
    focus: AssessmentRegistrySectorTypeEnum;
    disabled?: boolean;
}

const keySelector = (d: NonNullable<
    DimmensionType['subDimmensionInformation']
>[number]) => d.subDimmension;

function DimmensionItem(props: Props) {
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
        (name: string, subDimmensionData) => ({
            data: subDimmensionData,
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
    } = useFormArray<'summaryDimmensionMeta', SubDimensionMetaInputType>(
        'summaryDimmensionMeta', setFieldValue,
    );

    return (
        <div className={styles.dimension}>
            <ExpandableContainer
                className={styles.expandableContainer}
                heading={data.dimmensionDisplay}
                headingSize="extraSmall"
                withoutBorder
                headerActions={(
                    <SummaryDimensionMetaInput
                        name={+focus}
                        value={undefined}
                        onChange={onChangeDimensionMeta}
                        error={error?.summaryDimmensionMeta}
                        focus={focus}
                        dimension={data.dimmension}
                    />
                )}
                expansionTriggerArea="arrow"
            >
                <ListView
                    className={styles.subDimensionItem}
                    data={data.subDimmensionInformation}
                    keySelector={keySelector}
                    renderer={SubDimmensionItem}
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

export default DimmensionItem;
