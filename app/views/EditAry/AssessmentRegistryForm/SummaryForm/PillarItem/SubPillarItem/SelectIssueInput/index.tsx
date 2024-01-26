import React, { useCallback } from 'react';
import { TextInput } from '@the-deep/deep-ui';
import {
    EntriesAsList,
    useFormObject,
    useFormArray,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { randomString, isDefined, isNotDefined } from '@togglecorp/fujs';

import {
    PartialFormType,
    SummaryIssueType,
    SubPillarIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
import {
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
} from '#generated/types';

import IssueSearchSelectInput from '../../../IssueSearchSelectInput';

import styles from './styles.css';

interface Props {
    name: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
    order: number;
    disabled?: boolean;
    mainIndex?: number;
    placeholder?: string;
    value?: SubPillarIssueType;
    error?: Error<PartialFormType['summarySubPillarIssue']>;

    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
}

function SelectIssueInput(props: Props) {
    const {
        subPillar,
        subDimension,
        name,
        value,
        mainIndex,
        order,
        setIssueItemToClientIdMap,
        placeholder,
        issuesOptions: options,
        setIssuesOptions: setOptions,
        onChange,
        error,
        disabled,
    } = props;

    const {
        setValue: setSubPillarIssue,
        removeValue,
    } = useFormArray<
        'summarySubPillarIssue',
        SubPillarIssueType
    >('summarySubPillarIssue', onChange);

    const onFieldChange = useFormObject(mainIndex, setSubPillarIssue, {
        clientId: randomString(),
        order,
    });

    const handleIssueChange = useCallback((issueId: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                summaryIssue: issueId,
            };
            setIssueItemToClientIdMap((oldVal) => ({
                ...oldVal,
                [name]: newVal.clientId,
            }));
            onChange((oldVal: SubPillarIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubPillarIssue');
        } else if (!issueId && isDefined(mainIndex)) {
            removeValue(mainIndex);
        } else {
            onFieldChange(issueId, 'summaryIssue');
        }
    }, [
        name,
        order,
        value,
        onFieldChange,
        removeValue,
        mainIndex,
        setIssueItemToClientIdMap,
        onChange,
    ]);

    const handleTextChange = useCallback((newText: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                text: newText,
            };
            setIssueItemToClientIdMap((oldVal) => ({
                ...oldVal,
                [name]: newVal.clientId,
            }));
            onChange((oldVal: SubPillarIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubPillarIssue');
        } else {
            onFieldChange(newText, 'text');
        }
    }, [
        name,
        order,
        value,
        onFieldChange,
        setIssueItemToClientIdMap,
        onChange,
    ]);

    const getError = useCallback(
        (clientId?: string) => {
            if (!clientId) {
                return undefined;
            }
            return getErrorObject(getErrorObject(error)?.[clientId]);
        }, [error],
    );

    return (
        <div className={styles.input}>
            <IssueSearchSelectInput
                placeholder={placeholder}
                name="summaryIssue"
                value={value?.summaryIssue}
                subPillar={subPillar}
                subDimension={subDimension}
                onChange={handleIssueChange}
                options={options}
                onOptionsChange={setOptions}
                error={getError(value?.clientId)?.summaryIssue}
            />
            <TextInput
                placeholder="Drop text here"
                name="text"
                onChange={handleTextChange}
                value={value?.text}
                variant="general"
                disabled={disabled || isNotDefined(value?.summaryIssue)}
                error={getError(value?.clientId)?.text}
            />
        </div>

    );
}

export default SelectIssueInput;
