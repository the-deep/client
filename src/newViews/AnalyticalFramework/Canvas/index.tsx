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
    NodeRef,
    Attributes,
    Listeners,
} from '#components/ui/SortableList';

import { Widget } from '../types';
import WidgetPreview, { PartialWidget } from '../WidgetPreview';
import styles from './styles.scss';

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
    setNodeRef?: NodeRef;
    attributes?: Attributes;
    listeners?: Listeners;
    style?: React.CSSProperties;
}

function WidgetWrapper(props: WidgetProps) {
    const {
        isSecondary,
        widget,
        clientId,
        onWidgetValueChange,
        onWidgetEditClick,
        showWidgetEdit,
        showWidgetDelete,
        editMode,
        onWidgetDeleteClick,
        setNodeRef,
        attributes,
        listeners,
        style,
    } = props;

    return (
        <WidgetPreview
            className={_cs(
                styles.widget,
                isSecondary && widget?.width === 'half' && styles.halfWidget,
            )}
            key={clientId}
            name={clientId}
            value={undefined}
            onChange={onWidgetValueChange}
            widget={widget}
            nodeRef={setNodeRef}
            rootStyle={style}
            readOnly
            actions={(
                <>
                    {showWidgetEdit && (
                        <QuickActionButton
                            name={clientId}
                            onClick={onWidgetEditClick}
                            // FIXME: use translation
                            title="Edit Widget"
                            disabled={editMode}
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
                            disabled={editMode}
                        >
                            <IoTrash />
                        </QuickActionButton>
                    )}
                    {!editMode && (
                        <QuickActionButton
                            name={clientId}
                            // FIXME: use translation
                            title="Drag"
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
        isSecondary = false,
    } = props;

    const handleWidgetValueChange = useCallback(
        (value: unknown, widgetName: string) => {
            // NOTE: when we start work no tagging page, we need to handle this
            // for preview page, we can skip this as the components are disabled any way
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
        [props.editMode, props.onWidgetDelete, name],
    );
    const handleWidgetEditClick = useCallback(
        (widgetId: string) => {
            if (!props.editMode && props.onWidgetEdit) {
                props.onWidgetEdit(widgetId, name);
            }
        },
        [props.editMode, props.onWidgetEdit, name],
    );

    const handleWidgetOrderChange = useCallback(
        (value: Widget[]) => {
            if (!props.editMode && props.onWidgetOrderChange) {
                props.onWidgetOrderChange(value);
            }
        },
        [props.editMode, props.onWidgetOrderChange],
    );

    const widgetRendererParams = useCallback((key: string, data: Widget | PartialWidget) => ({
        clientId: key,
        isSecondary,
        widget: data,
        onWidgetValueChange: handleWidgetValueChange,
        showWidgetEdit: props.editMode,
        onWidgetEditClick: handleWidgetEditClick,
        showWidgetDelete: props.editMode,
        onWidgetDeleteClick: handleWidgetDeleteClick,
        editMode: props.editMode,
    }), [
        isSecondary,
        handleWidgetValueChange,
        handleWidgetEditClick,
        handleWidgetDeleteClick,
        props.editMode,
    ]);

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
                showDragOverlay
            />
        );
    }
    return (
        <SortableList
            className={styles.canvas}
            name="widgets"
            onChange={handleWidgetOrderChange}
            data={props.widgets}
            keySelector={widgetKeySelector}
            renderer={WidgetWrapper}
            direction="rect"
            rendererParams={widgetRendererParams}
            showDragOverlay
        />
    );
}
export default Canvas;
