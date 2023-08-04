import React, { useCallback } from 'react';
import { DropContainer, SelectInput } from '@the-deep/deep-ui';

interface Option {
    id: string;
    label: string;
}

interface Props {
    name: string;
    disabled?: boolean;
    placeholder?: string;
    options?: Option[] | null;
    value?: string;
    onChangeIssue: (v: string, n: string) => void;
    onDropChange: (v?: string) => void;
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
        onDropChange,
        options,
        keySelector,
        labelSelector,
    } = props;

    const handleChange = useCallback(
        (fValue, fName) => (
            onChangeIssue(fValue, fName)
        ), [onChangeIssue],
    );

    return (
        <>
            <SelectInput
                name={name}
                placeholder={placeholder}
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                optionsPending={disabled}
                onChange={handleChange}
                value={value}
                disabled={disabled}
            />
            <DropContainer
                name={name}
                onDrop={onDropChange}
                disabled={disabled}
            />
        </>

    );
}

export default SelectIssueInput;
