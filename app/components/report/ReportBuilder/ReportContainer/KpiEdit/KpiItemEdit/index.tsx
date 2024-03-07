import React from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    ColorInput,
    ExpandableContainer,
    DateInput,
    NumberInput,
    QuickActionButton,
    Switch,
    TextInput,
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

import styles from './styles.css';

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
        <ExpandableContainer
            heading={value.title ?? `Item: ${index + 1}`}
            headerActions={(
                <QuickActionButton
                    title="Remove Attributes"
                    name={index}
                    onClick={onRemove}
                >
                    <IoTrash />
                </QuickActionButton>
            )}
            contentClassName={styles.kpiItem}
            withoutBorder
        >
            <TextInput
                label="Title"
                name="title"
                onChange={onFieldChange}
                error={error?.title}
                value={value.title}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label="Subtitle"
                name="subtitle"
                onChange={onFieldChange}
                error={error?.subtitle}
                value={value.subtitle}
                disabled={disabled}
                readOnly={readOnly}
            />
            <NumberInput
                label="value"
                name="value"
                onChange={onFieldChange}
                error={error?.value}
                value={value.value}
                disabled={disabled}
                readOnly={readOnly}
            />
            <Switch
                label="Abbreviated value"
                name="abbreviateValue"
                onChange={onFieldChange}
                // error={error?.abbreviateValue}
                value={value.abbreviateValue}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label="Source title"
                name="source"
                onChange={onFieldChange}
                error={error?.source}
                value={value.source}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label="Source URL"
                name="sourceUrl"
                onChange={onFieldChange}
                error={error?.sourceUrl}
                value={value.sourceUrl}
                disabled={disabled}
                readOnly={readOnly}
            />
            <DateInput
                label="Date"
                name="date"
                onChange={onFieldChange}
                error={error?.date}
                value={value.date}
                disabled={disabled}
                readOnly={readOnly}
            />
            <ColorInput
                name="color"
                value={value?.color}
                onChange={onFieldChange}
                /* FIXME Add error, label and disabled in color input
                 error={error?.color}
                 disabled={disabled}
                 */
            />
        </ExpandableContainer>
    );
}

export default KpiItemEdit;
