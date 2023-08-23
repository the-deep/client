import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';

import {
    SubPillarIssuesMapType,
    SummaryIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
import { AssessmentRegistrySummarySubPillarTypeEnum } from '#generated/types';

import SelectIssueInput from './SelectIssueInput';

import styles from './styles.css';

interface Props {
    name?: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    value?: SubPillarIssuesMapType;
    options?: SummaryIssueType[] | null;
    setOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    onSuccessIssueAdd: (name: string, value: string) => void;
    disabled?: boolean;
}
function IssueInput(props: Props) {
    const {
        subPillar,
        name,
        value,
        options,
        setOptions,
        onSuccessIssueAdd,
        disabled,
    } = props;

    const getFieldValue = useCallback(
        (n?: string) => {
            if (isDefined(value) && isDefined(n)) {
                return value[n];
            }
            return undefined;
        }, [value],
    );

    return (
        <div className={styles.issueInput}>
            <SelectIssueInput
                name={`${name}-1`}
                placeholder="1. Field Name"
                value={getFieldValue(`${name}-1`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                setOptions={setOptions}
                subPillar={subPillar}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-2`}
                placeholder="2. Field Name"
                value={getFieldValue(`${name}-2`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                setOptions={setOptions}
                subPillar={subPillar}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-3`}
                placeholder="3. Field Name"
                value={getFieldValue(`${name}-3`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                subPillar={subPillar}
                setOptions={setOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-4`}
                placeholder="4. Field Name"
                value={getFieldValue(`${name}-4`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                subPillar={subPillar}
                setOptions={setOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-5`}
                placeholder="5. Field Name"
                value={getFieldValue(`${name}-5`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                subPillar={subPillar}
                setOptions={setOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-6`}
                placeholder="6. Field Name"
                value={getFieldValue(`${name}-6`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                subPillar={subPillar}
                setOptions={setOptions}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-7`}
                placeholder="7. Field Name"
                value={getFieldValue(`${name}-7`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                subPillar={subPillar}
                setOptions={setOptions}
            />
        </div>
    );
}
export default IssueInput;
