import React, { useCallback } from 'react';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Header, QuickActionButton } from '@the-deep/deep-ui';

import { AssessmentRegistrySummaryFocusDimensionTypeEnum } from '#generated/types';
import { PartialFormType, SubDimensionIssueType, SummaryIssueType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import SelectIssueInput from './SelectIssueInput';
import { DimensionType } from '../..';

import styles from './styles.css';

export interface Props {
    data: NonNullable<DimensionType['subDimensionInformation']>[number];
    value?: SubDimensionIssueType[];
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    name: string;
    disabled?: boolean;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    error: Error<PartialFormType['summarySubDimensionIssue']>;
    dimension: AssessmentRegistrySummaryFocusDimensionTypeEnum;
}

function SubDimensionItem(props: Props) {
    const {
        data,
        name,
        value,
        onChange,
        issuesOptions,
        setIssuesOptions,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
        disabled,
        error,
        dimension,
    } = props;

    const getFieldValue = useCallback(
        (n: string) => {
            const clientId = issueItemToClientIdMap[n];
            if (!clientId) {
                return undefined;
            }
            const itemInValue = value?.find((item) => item.clientId === clientId);
            return itemInValue;
        }, [value, issueItemToClientIdMap],
    );

    const getMainIndex = useCallback(
        (n: string) => {
            const clientId = issueItemToClientIdMap[n];
            if (!clientId) {
                return undefined;
            }
            const mainIndex = value?.findIndex((item) => item.clientId === clientId);
            return mainIndex;
        }, [value, issueItemToClientIdMap],
    );

    return (
        <div className={styles.subDimensionItem}>
            <Header
                heading={data.subDimensionDisplay}
                headingSize="extraSmall"
                actions={(
                    <QuickActionButton
                        name={data.subDimension}
                        // onClick={showModal}
                        title="add issue"
                    >
                        <IoAddCircleOutline />
                    </QuickActionButton>
                )}
            />
            <div className={styles.issueInput}>
                <SelectIssueInput
                    name={`${name}-1`}
                    order={1}
                    placeholder="1. Field Name"
                    value={getFieldValue(`${name}-1`)}
                    mainIndex={getMainIndex(`${name}-1`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    setIssuesOptions={setIssuesOptions}
                    subDimension={data.subDimension}
                    dimension={dimension}
                    disabled={disabled}
                    error={error}
                />
            </div>
        </div>
    );
}

export default SubDimensionItem;
