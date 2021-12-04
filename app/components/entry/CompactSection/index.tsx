import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    QuickActionButton,
    ListView,
    Container,
} from '@the-deep/deep-ui';
import { SetValueArg, Error, getErrorObject } from '@togglecorp/toggle-form';
import { IoAdd } from 'react-icons/io5';

import { GeoArea } from '#components/GeoMultiSelectInput';
import { Widget } from '#types/newAnalyticalFramework';
import CompactAttributeInput, { Props as AttributeInputProps } from '#components/framework/CompactAttributeInput';
import { PartialEntryType } from '#views/Project/EntryEdit/schema';

import styles from './styles.css';

const widgetKeySelector = (d: Widget) => d.clientId;
type WidgetAttribute = NonNullable<PartialEntryType['attributes']>[number];

export interface Props {
    className?: string;
    widgets: Widget[] | undefined | null;
    title?: string;
    error: Error<WidgetAttribute[]> | undefined;
    onAttributeChange: (val: SetValueArg<WidgetAttribute>, index: number | undefined) => void;
    attributesMap: Partial<Record<string, { index: number, value: WidgetAttribute }>>;
    readOnly?: boolean;
    emptyValueHidden?: boolean;
    disabled?: boolean;
    entryClientId: string;
    sectionId?: string;
    onApplyToAll?: (entryId: string, widgetId: string, applyBelowOnly?: boolean) => void;
    onAddButtonClick: (entryId: string, sectionId?: string) => void;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
}

function CompactSection(props: Props) {
    const {
        className,
        title,
        onAttributeChange,
        widgets,
        attributesMap,
        entryClientId,
        sectionId,
        emptyValueHidden,
        readOnly,
        disabled,
        error: riskyError,
        onAddButtonClick,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onApplyToAll,
    } = props;

    const error = getErrorObject(riskyError);

    const widgetsWithValue = useMemo(() => {
        if (!emptyValueHidden) {
            return widgets;
        }
        return widgets?.filter(
            // FIXME: should only check into data, not value
            (widget) => isDefined(attributesMap?.[widget.clientId]?.value?.data?.value),
        );
    }, [emptyValueHidden, attributesMap, widgets]);

    const handleApplyBelowClick = useCallback(
        (widgetId: string) => {
            if (onApplyToAll) {
                onApplyToAll(entryClientId, widgetId, true);
            }
        },
        [entryClientId, onApplyToAll],
    );

    const handleApplyAllClick = useCallback(
        (widgetId: string) => {
            console.warn(widgetId, entryClientId, onApplyToAll);
            if (onApplyToAll) {
                onApplyToAll(entryClientId, widgetId, false);
            }
        },
        [entryClientId, onApplyToAll],
    );

    const widgetRendererParams = useCallback(
        (key: string, data: Widget): AttributeInputProps<number | undefined> => {
            const attribute = attributesMap[key];
            const err = attribute
                ? error?.[attribute.value.clientId]
                : undefined;
            return {
                name: attribute?.index,
                value: attribute?.value,
                widget: data,
                onChange: onAttributeChange,
                readOnly,
                disabled,
                error: err,
                geoAreaOptions,
                onGeoAreaOptionsChange,
                onApplyBelowClick: handleApplyBelowClick,
                onApplyAllClick: handleApplyAllClick,
            };
        },
        [
            onAttributeChange,
            attributesMap,
            readOnly,
            disabled,
            error,
            geoAreaOptions,
            onGeoAreaOptionsChange,
            handleApplyBelowClick,
            handleApplyAllClick,
        ],
    );

    const handleAddButtonClick = useCallback(() => {
        onAddButtonClick(entryClientId, sectionId);
    }, [
        entryClientId,
        sectionId,
        onAddButtonClick,
    ]);

    return (
        <Container
            className={_cs(className, styles.compactSection)}
            heading={title}
            headerActions={!readOnly && (
                <QuickActionButton
                    name="addAttribute"
                    onClick={handleAddButtonClick}
                >
                    <IoAdd />
                </QuickActionButton>
            )}
            headingSize="extraSmall"
            spacing="comfortable"
        >
            <ListView
                className={styles.widgetList}
                data={widgetsWithValue ?? undefined}
                keySelector={widgetKeySelector}
                renderer={CompactAttributeInput}
                rendererParams={widgetRendererParams}
                compactEmptyMessage
                pending={false}
                filtered={false}
                emptyMessage="There are no widgets in this section"
                messageShown
            />
        </Container>
    );
}

export default CompactSection;
