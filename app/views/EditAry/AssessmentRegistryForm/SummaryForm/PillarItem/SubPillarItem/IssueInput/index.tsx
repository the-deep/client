import React, { useCallback } from 'react';
import {
    EntriesAsList,
} from '@togglecorp/toggle-form';

import {
    SubPillarIssueType,
    SummaryIssueType,
    PartialFormType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
import { AssessmentRegistrySummarySubPillarTypeEnum } from '#generated/types';

import SelectIssueInput from './SelectIssueInput';

import styles from './styles.css';

interface Props {
    name?: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    disabled?: boolean;
    value: SubPillarIssueType[] | undefined;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    issueOptions?: SummaryIssueType[] | null;
    setIssueOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}
function IssueInput(props: Props) {
    const {
        subPillar,
        name,
        issueOptions,
        setIssueOptions,
        value,
        onChange,
        disabled,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
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
    console.log('aditya', issueItemToClientIdMap);

    return (
        <div className={styles.issueInput}>
            <SelectIssueInput
                name={`${name}-1`}
                order={1}
                placeholder="1. Field Name"
                value={getFieldValue(`${name}-1`)}
                mainIndex={getMainIndex(`${name}-1`)}
                onChange={onChange}
                issueOptions={issueOptions}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                setIssueOptions={setIssueOptions}
                subPillar={subPillar}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-2`}
                order={2}
                placeholder="2. Field Name"
                value={getFieldValue(`${name}-2`)}
                mainIndex={getMainIndex(`${name}-2`)}
                onChange={onChange}
                issueOptions={issueOptions}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                setIssueOptions={setIssueOptions}
                subPillar={subPillar}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-3`}
                order={3}
                placeholder="3. Field Name"
                value={getFieldValue(`${name}-3`)}
                mainIndex={getMainIndex(`${name}-3`)}
                onChange={onChange}
                issueOptions={issueOptions}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                subPillar={subPillar}
                setIssueOptions={setIssueOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-4`}
                order={4}
                placeholder="4. Field Name"
                value={getFieldValue(`${name}-4`)}
                mainIndex={getMainIndex(`${name}-4`)}
                onChange={onChange}
                issueOptions={issueOptions}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                subPillar={subPillar}
                setIssueOptions={setIssueOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-5`}
                order={5}
                placeholder="5. Field Name"
                value={getFieldValue(`${name}-5`)}
                mainIndex={getMainIndex(`${name}-5`)}
                onChange={onChange}
                issueOptions={issueOptions}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                subPillar={subPillar}
                setIssueOptions={setIssueOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-6`}
                order={6}
                placeholder="6. Field Name"
                value={getFieldValue(`${name}-6`)}
                mainIndex={getMainIndex(`${name}-6`)}
                onChange={onChange}
                issueOptions={issueOptions}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                subPillar={subPillar}
                setIssueOptions={setIssueOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-7`}
                order={7}
                placeholder="7. Field Name"
                value={getFieldValue(`${name}-7`)}
                mainIndex={getMainIndex(`${name}-7`)}
                onChange={onChange}
                issueOptions={issueOptions}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                subPillar={subPillar}
                setIssueOptions={setIssueOptions}
            />
        </div>
    );
}
export default IssueInput;
