import React, { useCallback, useEffect, useState } from 'react';
import { SelectInput, TextInput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { SubPillarIssueInputType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

interface Option {
    id: string;
    label: string;
}

interface Props {
    name: string;
    disabled?: boolean;
    placeholder?: string;
    options?: Option[] | null;
    value: SubPillarIssueInputType;
    onChangeIssue: (data: SubPillarIssueInputType) => void;
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

    const [issueValue, setIssueValue] = useState<SubPillarIssueInputType>({
        issueId: '',
        text: undefined,
        name: '',
        order: '',
    });

    const handleInputChange = useCallback(
        (fieldValue, fieldName: string) => {
            setIssueValue(() => {
                if (fieldName === 'issueId') {
                    return {
                        name,
                        order: name.split('-')[1],
                        text: value?.text,
                        issueId: fieldValue,
                    };
                }
                if (fieldName === 'text') {
                    return {
                        name,
                        order: name.split('-')[1],
                        text: fieldValue,
                        issueId: value.issueId,
                    };
                }
                return value;
            });
        }, [setIssueValue, name, value],
    );

    useEffect(() => onChangeIssue(issueValue), [onChangeIssue, issueValue]);

    return (
        <>
            <SelectInput
                name="issueId"
                placeholder={placeholder}
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                optionsPending={disabled}
                onChange={handleInputChange}
                value={value?.issueId}
                disabled={disabled}
            />
            <TextInput
                placeholder="Drop text here"
                name="text"
                onChange={handleInputChange}
                value={value?.text}
                variant="general"
                disabled={disabled || isNotDefined(value?.issueId)}
            />
        </>

    );
}

export default SelectIssueInput;
