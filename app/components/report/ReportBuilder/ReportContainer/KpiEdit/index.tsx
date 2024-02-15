import React, {
    useMemo,
    useCallback,
} from 'react';
import {
    _cs,
    randomString,
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
    type TextContentStyleFormType,
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
    // disabled?: boolean;
}

function KpiEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        error: riskyError,
        // disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, KpiConfigType
    >(name, onChange, {});

    const onTitleStyleChange = useFormObject<
        'titleContentStyle', TextContentStyleFormType
    >('titleContentStyle', onFieldChange, {});

    const onSubtitleStyleChange = useFormObject<
        'subtitleContentStyle', TextContentStyleFormType
    >('subtitleContentStyle', onFieldChange, {});

    const onSourceContentStyleChange = useFormObject<
        'sourceContentStyle', TextContentStyleFormType
    >('sourceContentStyle', onFieldChange, {});

    const onValueContentStyleChange = useFormObject<
        'valueContentStyle', TextContentStyleFormType
    >('valueContentStyle', onFieldChange, {});

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

    return (
        <div className={_cs(className, styles.kpiEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="Configuration"
                headingSize="small"
                spacing="compact"
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
                    name="content"
                    label="Title"
                    value={value?.titleContentStyle?.content}
                    onChange={onTitleStyleChange}
                />
                <TextElementsStylesEdit
                    name="content"
                    label="Subtitle"
                    value={value?.subtitleContentStyle?.content}
                    onChange={onSubtitleStyleChange}
                />
                <TextElementsStylesEdit
                    name="content"
                    label="Source"
                    value={value?.sourceContentStyle?.content}
                    onChange={onSourceContentStyleChange}
                />
                <TextElementsStylesEdit
                    name="content"
                    label="Value"
                    value={value?.valueContentStyle?.content}
                    onChange={onValueContentStyleChange}
                />
            </ExpandableContainer>
        </div>
    );
}

export default KpiEdit;
