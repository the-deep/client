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
    SubDimensionIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
import {
    AssessmentRegistrySectorTypeEnum,
    AssessmentRegistrySummarySubDimensionTypeEnum,
} from '#generated/types';

import IssueSearchSelectInput from '../../../IssueSearchSelectInput';
import styles from './styles.css';

interface Props {
    name: string;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
    order: number;
    disabled?: boolean;
    mainIndex?: number;
    placeholder?: string;
    value?: SubDimensionIssueType;
    error?: Error<PartialFormType['summarySubDimensionIssue']>;

    setDimensionIssueToClientIdMap: React.Dispatch<React.SetStateAction<
    Record<string, string>>>;
    dimensionIssuesOptions?: SummaryIssueType[] | null;
    setDimensionIssuesOptions: React.Dispatch<React.SetStateAction<
    SummaryIssueType[]
    | undefined
    | null
    >>;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;

    sector: AssessmentRegistrySectorTypeEnum;
}

function SelectIssueInput(props: Props) {
    const {
        subDimension,
        name,
        value,
        mainIndex,
        order,
        setDimensionIssueToClientIdMap,
        placeholder,
        dimensionIssuesOptions: options,
        setDimensionIssuesOptions: setOptions,
        onChange,
        sector,
        error,
        disabled,
    } = props;

    const {
        setValue: setSubDimensionIssue,
        removeValue,
    } = useFormArray<
        'summarySubDimensionIssue',
        SubDimensionIssueType
    >('summarySubDimensionIssue', onChange);

    const onFieldChange = useFormObject(mainIndex, setSubDimensionIssue, {
        clientId: randomString(),
        order,
        sector,
    });

    const handleIssueChange = useCallback((issueId: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                summaryIssue: issueId,
                sector,
            };
            setDimensionIssueToClientIdMap((oldVal) => ({
                ...oldVal,
                [name]: newVal.clientId,
            }));
            onChange((oldVal: SubDimensionIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubDimensionIssue');
        } else if (!issueId && isDefined(mainIndex)) {
            removeValue(mainIndex);
        } else {
            onFieldChange(issueId, 'summaryIssue');
        }
    }, [
        name,
        order,
        value,
        sector,
        removeValue,
        mainIndex,
        onFieldChange,
        setDimensionIssueToClientIdMap,
        onChange,
    ]);

    const handleTextChange = useCallback((newText: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                text: newText,
                sector,
            };
            setDimensionIssueToClientIdMap((oldVal) => ({
                ...oldVal,
                [name]: newVal.clientId,
            }));
            onChange((oldVal: SubDimensionIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubDimensionIssue');
        } else {
            onFieldChange(newText, 'text');
        }
    }, [
        name,
        order,
        value,
        sector,
        onFieldChange,
        setDimensionIssueToClientIdMap,
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
