import React, { useCallback, useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';

import { SubPillarIssueInputType } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import SelectIssueInput from './SelectIssueInput';

import styles from './styles.css';

interface Option {
    id: string;
    label: string;
}

interface Props {
    name?: string;
    options?: Option[] | null;
    value: SubPillarIssueInputType[];
    setValue: React.Dispatch<React.SetStateAction<SubPillarIssueInputType[]>>;
    onSuccessIssueAdd: (issue: SubPillarIssueInputType[]) => void;
    disabled?: boolean;
}

const keySelector = (d: Option) => d.id;
const labelSelector = (d: Option) => d.label;

function IssueInput(props: Props) {
    const {
        name,
        options,
        value,
        setValue,
        onSuccessIssueAdd,
        disabled,
    } = props;

    const mappedIssueItem = useMemo(
        () => listToMap(value, (d) => d.name), [value],
    );

    const handleIssueSelect = useCallback(
        (issueVal: SubPillarIssueInputType) => {
            setValue((prev) => {
                const filteredIssues = prev.filter(
                    (item) => item.name !== issueVal.name,
                );
                return [...filteredIssues, issueVal];
            });
            onSuccessIssueAdd(value);
        }, [setValue, value, onSuccessIssueAdd],
    );

    return (
        <div className={styles.input}>
            <SelectIssueInput
                name={`${name}-1`}
                placeholder="1. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={mappedIssueItem[`${name}-1`]}
                onChangeIssue={handleIssueSelect}
                disabled={disabled}
                options={options}
            />
            <SelectIssueInput
                name={`${name}-2`}
                placeholder="2. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={mappedIssueItem[`${name}-2`]}
                onChangeIssue={handleIssueSelect}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-3`}
                placeholder="3. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={mappedIssueItem[`${name}-3`]}
                onChangeIssue={handleIssueSelect}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-4`}
                placeholder="4. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={mappedIssueItem[`${name}-4`]}
                onChangeIssue={handleIssueSelect}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-5`}
                placeholder="5. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={mappedIssueItem[`${name}-5`]}
                onChangeIssue={handleIssueSelect}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-6`}
                placeholder="6. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={mappedIssueItem[`${name}-6`]}
                onChangeIssue={handleIssueSelect}
                options={options}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-7`}
                placeholder="7. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={mappedIssueItem[`${name}-7`]}
                onChangeIssue={handleIssueSelect}
                options={options}
                disabled={disabled}
            />
        </div>
    );
}
export default IssueInput;
