import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { IssuesMapType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import SelectIssueInput from './SelectIssueInput';

import styles from './styles.css';

interface Option {
    id: string;
    label: string;
}

interface Props {
    name?: string;
    options: Option[];
    value?: IssuesMapType;
    onSuccessIssueAdd: (name: string, value: string) => void;
    disabled?: boolean;
}

const keySelector = (d: Option) => d.id;
const labelSelector = (d: Option) => d.label;

function IssueInput(props: Props) {
    const {
        name,
        value,
        options,
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
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={getFieldValue(`${name}-1`)}
                // value={undefined}
                onChangeIssue={onSuccessIssueAdd}
                disabled={disabled}
                options={options}
            />
            <SelectIssueInput
                name={`${name}-2`}
                placeholder="2. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={getFieldValue(`${name}-2`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-3`}
                placeholder="3. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={getFieldValue(`${name}-3`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-4`}
                placeholder="4. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={getFieldValue(`${name}-4`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-5`}
                placeholder="5. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={getFieldValue(`${name}-5`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-6`}
                placeholder="6. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={getFieldValue(`${name}-6`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-7`}
                placeholder="7. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={getFieldValue(`${name}-7`)}
                onChangeIssue={onSuccessIssueAdd}
                options={options}
                disabled={disabled}
            />
        </div>
    );
}
export default IssueInput;
