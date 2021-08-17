import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
} from '@the-deep/deep-ui';
import { GrDrag } from 'react-icons/gr';
import {
    IoCreateOutline,
    IoTrash,
} from 'react-icons/io5';

import SortableList, {
    Attributes,
    Listeners,
} from '#components/SortableList';

import { Widget } from '#types/newAnalyticalFramework';

import WidgetPreview, { PartialWidget } from './WidgetPreview';
import styles from './styles.css';

interface WidgetProps {
    isSecondary: boolean;
    widget: PartialWidget;
    clientId: string;
    onWidgetValueChange: (value: unknown, widgetName: string) => void;
    onWidgetEditClick: (widgetName: string) => void;
    onWidgetDeleteClick: (widgetName: string) => void;
    showWidgetEdit: boolean | undefined;
    showWidgetDelete: boolean | undefined;
    editMode: boolean | undefined;
    attributes?: Attributes;
    listeners?: Listeners;
    disabled?: boolean;
}

function WidgetWrapper(props: WidgetProps) {
    const {
        widget,
        clientId,
        onWidgetValueChange,
        onWidgetEditClick,
        showWidgetEdit,
        showWidgetDelete,
        editMode,
        onWidgetDeleteClick,
        attributes,
        listeners,
        disabled,
    } = props;

    return (
        <WidgetPreview
            key={clientId}
            name={clientId}
            value={undefined}
            onChange={onWidgetValueChange}
            widget={widget}
            readOnly
            actions={(
                <>
                    {showWidgetEdit && (
                        <QuickActionButton
                            name={clientId}
                            onClick={onWidgetEditClick}
                            // FIXME: use translation
                            title="Edit Widget"
                            disabled={editMode || disabled}
                        >
                            <IoCreateOutline />
                        </QuickActionButton>
                    )}
                    {showWidgetDelete && (
                        <QuickActionButton
                            name={clientId}
                            onClick={onWidgetDeleteClick}
                            // FIXME: use translation
                            title="Delete Widget"
                            disabled={editMode || disabled}
                        >
                            <IoTrash />
                        </QuickActionButton>
                    )}
                    {!editMode && (
                        <QuickActionButton
                            name={clientId}
                            // FIXME: use translation
                            title="Drag"
                            disabled={disabled}
                            {...attributes}
                            {...listeners}
                        >
                            <GrDrag />
                        </QuickActionButton>
                    )}
                </>
            )}
        />
    );
}

const partialWidgetKeySelector = (d: PartialWidget) => d.clientId;
const widgetKeySelector = (d: Widget) => d.clientId;

type Props<T> = {
    name: T;
    isSecondary?: boolean;
    disabled?: boolean;
} & ({
    editMode?: false;
    widgets: Widget[] | undefined;
    onWidgetOrderChange?: (widgets: Widget[]) => void;
    onWidgetDelete?: (widgetId: string, name: T) => void;
    onWidgetEdit?: (widgetId: string, name: T) => void;
} | {
    editMode: true;
    widgets: PartialWidget[] | undefined;
    onWidgetOrderChange?: never;
    onWidgetDelete?: never;
    onWidgetEdit?: never;
})

function Canvas<T>(props: Props<T>) {
    const {
        name,
        /*
        widgets,
        editMode,
        onWidgetDelete,
        onWidgetEdit,
        onWidgetOrderChange,
        */
        disabled,
        isSecondary = false,
    } = props;

    const handleWidgetValueChange = useCallback(
        (_: unknown, widgetName: string) => {
            // NOTE: when we start work no tagging page, we need to handle this
            // for preview page, we can skip this as the components are disabled any way
            // eslint-disable-next-line no-console
            console.warn(`Trying to edit widget ${widgetName} from section ${name}`);
        },
        [name],
    );
    const handleWidgetDeleteClick = useCallback(
        (widgetId: string) => {
            if (!props.editMode && props.onWidgetDelete) {
                props.onWidgetDelete(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [props.editMode, props.onWidgetDelete, name],
    );
    const handleWidgetEditClick = useCallback(
        (widgetId: string) => {
            if (!props.editMode && props.onWidgetEdit) {
                props.onWidgetEdit(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [props.editMode, props.onWidgetEdit, name],
    );

    const handleWidgetOrderChange = useCallback(
        (value: Widget[]) => {
            if (!props.editMode && props.onWidgetOrderChange) {
                props.onWidgetOrderChange(value);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [props.editMode, props.onWidgetOrderChange],
    );

    const widgetRendererParams = useCallback((key: string, data: Widget | PartialWidget) => ({
        clientId: key,
        isSecondary,
        widget: data,
        onWidgetValueChange: handleWidgetValueChange,
        containerClassName: _cs(
            styles.widgetContainer,
            (isSecondary && data?.width === 'half') && styles.halfWidget,
        ),
        showWidgetEdit: !props.editMode,
        onWidgetEditClick: handleWidgetEditClick,
        showWidgetDelete: !props.editMode,
        onWidgetDeleteClick: handleWidgetDeleteClick,
        editMode: props.editMode,
        disabled,
    }), [
        isSecondary,
        handleWidgetValueChange,
        handleWidgetEditClick,
        handleWidgetDeleteClick,
        // eslint-disable-next-line react/destructuring-assignment
        props.editMode,
        disabled,
    ]);

    const itemContainerParams = useCallback((_: string, data: Widget | PartialWidget) => ({
        className: _cs(
            styles.widgetContainer,
            (isSecondary && data?.width === 'half') && styles.halfWidget,
        ),
    }), [
        isSecondary,
    ]);

    // eslint-disable-next-line react/destructuring-assignment
    if (props.editMode) {
        return (
            <SortableList
                className={styles.canvas}
                name="widgets"
                data={props.widgets}
                keySelector={partialWidgetKeySelector}
                renderer={WidgetWrapper}
                direction="rect"
                rendererParams={widgetRendererParams}
                itemContainerParams={itemContainerParams}
                showDragOverlay
            />
        );
    }
    return (
        <SortableList
            className={styles.canvas}
            name="widgets"
            onChange={handleWidgetOrderChange}
            // eslint-disable-next-line react/destructuring-assignment
            data={props.widgets}
            keySelector={widgetKeySelector}
            renderer={WidgetWrapper}
            direction="rect"
            rendererParams={widgetRendererParams}
            itemContainerParams={itemContainerParams}
            showDragOverlay
        />
    );
}
export default Canvas;