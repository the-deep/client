import React from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    Container,
    TextInput,
    NumberInput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { IoTrash } from 'react-icons/io5';

import {
    type FinalKpiItemType,
} from '../../../../schema';

type KpiItemType = FinalKpiItemType;

const defaultKpiItem = (): KpiItemType => ({
    clientId: randomString(),
});

interface Props {
    value: KpiItemType;
    onChange: (
        value: SetValueArg<KpiItemType>,
        index: number,
    ) => void | undefined;
    onRemove: (index: number) => void;
    index: number;
    error: Error<KpiItemType> | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

function KpiItemEdit(props: Props) {
    const {
        value,
        onChange,
        index,
        error: riskyError,
        onRemove,
        disabled,
        readOnly,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultKpiItem,
    );

    return (
        <Container
            heading={`Item ${index + 1}`}
            headerActions={(
                <QuickActionButton
                    title="Remove Attributes"
                    name={index}
                    onClick={onRemove}
                >
                    <IoTrash />
                </QuickActionButton>
            )}
        >
            <TextInput
                label="Title"
                name="title"
                onChange={onFieldChange}
                // error={error?.title}
                value={value.title}
                disabled={disabled}
                readOnly={readOnly}
            />
            <NumberInput
                label="value"
                name="value"
                onChange={onFieldChange}
                // error={error?.value}
                value={value.value}
                disabled={disabled}
                readOnly={readOnly}
            />
        </Container>
    );
}

export default KpiItemEdit;
