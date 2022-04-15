import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    QuickActionButton,
    ListView,
    Container,
} from '@the-deep/deep-ui';
import { SetValueArg, Error, getErrorObject } from '@togglecorp/toggle-form';
import { IoAdd } from 'react-icons/io5';

import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    Widget,
    WidgetHint,
    getHiddenWidgetIds,
} from '#types/newAnalyticalFramework';
import CompactAttributeInput, { Props as AttributeInputProps } from '#components/framework/CompactAttributeInput';
import { PartialEntryType } from '#views/Project/EntryEdit/schema';

import styles from './styles.css';

const widgetKeySelector = (d: Widget) => d.clientId;
type WidgetAttribute = NonNullable<PartialEntryType['attributes']>[number];

export interface Props {
    // NOTE: if allWidgets is null/undefined/empty then the conditional widgets will be visible
    allWidgets: Widget[] | undefined | null;

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
    onAddButtonClick: ((entryId: string, sectionId?: string) => void) | undefined;
    addButtonHidden?: boolean;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    widgetsHints?: WidgetHint[];
}

function CompactSection(props: Props) {
    const {
        allWidgets,
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
        addButtonHidden,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onApplyToAll,
        widgetsHints,
    } = props;

    const filteredWidgets = useMemo(
        () => {
            const hiddenWidgetIds = getHiddenWidgetIds(
                allWidgets ?? [],
                Object.values(attributesMap)
                    .filter(isDefined)
                    .map((item) => item.value),
            );
            return widgets?.filter((w) => !hiddenWidgetIds[w.id]);
        },
        [allWidgets, attributesMap, widgets],
    );

    const error = getErrorObject(riskyError);

    const hintsMap = useMemo(
        () => listToMap(
            widgetsHints?.filter((widgetHint) => widgetHint.hints.length > 0),
            (widgetHint) => widgetHint.widgetPk,
            (widgetHint) => widgetHint,
        ),
        [widgetsHints],
    );

    const widgetsWithValue = useMemo(() => {
        if (!emptyValueHidden) {
            return filteredWidgets;
        }
        return filteredWidgets?.filter(
            // FIXME: should only check into data, not value
            (widget) => {
                if ((hintsMap?.[widget.id]?.hints.length ?? 0) > 0) {
                    return true;
                }
                if (widget.widgetId === 'MATRIX1D') {
                    return !doesObjectHaveNoData(
                        attributesMap?.[widget.clientId]?.value?.data?.value,
                        [''],
                    );
                }

                if (widget.widgetId === 'MATRIX2D') {
                    const val = attributesMap?.[widget.clientId]?.value?.data?.value;
                    return Object.keys(val ?? {}).length > 0;
                }

                return isDefined(attributesMap?.[widget.clientId]?.value?.data?.value);
            },
        );
    }, [
        hintsMap,
        emptyValueHidden,
        attributesMap,
        filteredWidgets,
    ]);

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
                applyButtonsHidden: !onApplyToAll,
                onApplyBelowClick: handleApplyBelowClick,
                onApplyAllClick: handleApplyAllClick,
                widgetsHints,
            };
        },
        [
            widgetsHints,
            onApplyToAll,
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
        if (onAddButtonClick) {
            onAddButtonClick(entryClientId, sectionId);
        }
    }, [
        entryClientId,
        sectionId,
        onAddButtonClick,
    ]);

    return (
        <Container
            className={_cs(className, styles.compactSection)}
            heading={title}
            headerActions={(!readOnly && !addButtonHidden) && (
                <QuickActionButton
                    name="addAttribute"
                    onClick={handleAddButtonClick}
                    title="Add tags"
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
                errored={false}
                emptyMessage="No widgets were tagged under this section."
                messageShown
                messageIconShown
            />
        </Container>
    );
}

export default CompactSection;
