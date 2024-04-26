import React, {
    useMemo,
    useCallback,
} from 'react';
import {
    _cs,
    randomString,
    isDefined,
} from '@togglecorp/fujs';
import {
    type SetValueArg,
    type Error,
    useFormObject,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    Button,
    ExpandableContainer,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';

import KpiItemEdit from './KpiItemEdit';
import {
    type KpiConfigType,
    type FinalKpiItemType,
} from '../../../schema';
import TextElementsStylesEdit from '../TextElementsStylesEdit';

import styles from './styles.css';

type KpiItemType = FinalKpiItemType;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: KpiConfigType | undefined;
    onChange: (value: SetValueArg<KpiConfigType | undefined>, name: NAME) => void;
    error?: Error<KpiConfigType>;
    disabled?: boolean;
}

function KpiEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, KpiConfigType
    >(name, onChange, {});

    const {
        setValue: onKpiItemChange,
        removeValue: onKpiItemRemove,
    } = useFormArray<
        'items',
        KpiItemType
    >('items', onFieldChange);

    const kpiItemsError = useMemo(
        () => getErrorObject(error?.items),
        [error?.items],
    );

    const handleAddKpiItem = useCallback(() => {
        onFieldChange(
            (oldValue: KpiConfigType['items']) => {
                const safeOldValue = oldValue ?? [];
                const newClientId = randomString();
                const newKpiItem: KpiItemType = {
                    clientId: newClientId,
                };
                return [...safeOldValue, newKpiItem];
            },
            'items',
        );
    }, [onFieldChange]);

    const configHasError = isDefined(error?.items);

    return (
        <div className={_cs(className, styles.kpiEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="Configuration"
                headingSize="small"
                spacing="compact"
                errored={configHasError}
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                {value?.items?.map((attribute, index) => (
                    <KpiItemEdit
                        key={attribute.clientId}
                        value={attribute}
                        index={index}
                        onChange={onKpiItemChange}
                        error={kpiItemsError?.[attribute.clientId]}
                        onRemove={onKpiItemRemove}
                    />
                ))}
                <Button
                    title="Add attributes"
                    name="addAttributes"
                    onClick={handleAddKpiItem}
                    className={styles.addButton}
                    variant="tertiary"
                    spacing="compact"
                    disabled={disabled}
                >
                    Add Item
                </Button>
            </ExpandableContainer>
            <ExpandableContainer
                heading="Styling"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextElementsStylesEdit
                    name="titleContentStyle"
                    label="Title"
                    value={value?.titleContentStyle}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="subtitleContentStyle"
                    label="Subtitle"
                    value={value?.subtitleContentStyle}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="sourceContentStyle"
                    label="Source"
                    value={value?.sourceContentStyle}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="valueContentStyle"
                    label="Value"
                    value={value?.valueContentStyle}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
            </ExpandableContainer>
        </div>
    );
}

export default KpiEdit;
