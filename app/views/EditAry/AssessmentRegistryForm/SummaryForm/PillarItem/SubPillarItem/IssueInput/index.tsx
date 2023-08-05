import React, { useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
} from '#generated/types';

import { SubSectorIssueInputType } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import SelectIssueInput from './SelectIssueInput';

import styles from './styles.css';

interface Option {
    id: string;
    label: string;
}

interface Props {
    name?: AssessmentRegistrySummarySubSectorTypeEnum;
    options?: Option[] | null;
    value: SubSectorIssueInputType[];
    onValueChange: (data: SubSectorIssueInputType) => void;
    disabled?: boolean;
}

const keySelector = (d: Option) => d.id;
const labelSelector = (d: Option) => d.label;

function IssueInput(props: Props) {
    const {
        name,
        options,
        value,
        onValueChange,
        disabled,
    } = props;

    const mappedIssuesList = useMemo(
        () => listToMap(
            value,
            (d) => d.name,
        ), [value],
    );

    return (
        <div className={styles.input}>
            <SelectIssueInput
                name={`${name}-1`}
                placeholder="1. Field Name"
                onChangeIssue={onValueChange}
                options={options}
                value={mappedIssuesList[`${name}-1`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-2`}
                placeholder="2. Field Name"
                onChangeIssue={onValueChange}
                options={options}
                value={mappedIssuesList[`${name}-2`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-3`}
                placeholder="3. Field Name"
                onChangeIssue={onValueChange}
                options={options}
                value={mappedIssuesList[`${name}-3`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-4`}
                placeholder="4. Field Name"
                onChangeIssue={onValueChange}
                options={options}
                value={mappedIssuesList[`${name}-4`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-5`}
                placeholder="5. Field Name"
                onChangeIssue={onValueChange}
                options={options}
                value={mappedIssuesList[`${name}-5`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-6`}
                placeholder="6. Field Name"
                onChangeIssue={onValueChange}
                options={options}
                value={mappedIssuesList[`${name}-6`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={disabled}
            />
            <SelectIssueInput
                name={`${name}-7`}
                placeholder="7. Field Name"
                onChangeIssue={onValueChange}
                options={options}
                value={mappedIssuesList[`${name}-7`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={disabled}
            />
        </div>
    );
}
export default IssueInput;
