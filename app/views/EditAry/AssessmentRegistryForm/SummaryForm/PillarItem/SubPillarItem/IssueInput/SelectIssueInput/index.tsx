import React, { useCallback } from 'react';
import { SelectInput, TextInput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';

import { Option } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import styles from './styles.css';

interface Props {
    name: string;
    disabled?: boolean;
    placeholder?: string;
    options?: Option[];
    value?: {
        summaryIssue?: string;
        text?: string;
        order?: number;
    };
    onChangeIssue: (name: string, value: string) => void;
    keySelector: (d: Option) => string;
    labelSelector: (d: Option) => string;
}

function SelectIssueInput(props: Props) {
    const {
        name,
        placeholder,
        disabled,
        value,
        onChangeIssue,
        options,
        keySelector,
        labelSelector,
    } = props;

    const handleInputChange = useCallback(
        (fieldValue, fieldName: string) => {
            onChangeIssue(fieldName, fieldValue);
        }, [onChangeIssue],
    );

    return (
        <div className={styles.input}>
            <SelectInput
                name={name}
                placeholder={placeholder}
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                optionsPending={disabled}
                onChange={handleInputChange}
                value={value?.summaryIssue}
                disabled={disabled}
            />
            <TextInput
                placeholder="Drop text here"
                name="text"
                onChange={handleInputChange}
                value={value?.text}
                variant="general"
                disabled={disabled || isNotDefined(value?.summaryIssue)}
            />
        </div>

    );
}

export default SelectIssueInput;
