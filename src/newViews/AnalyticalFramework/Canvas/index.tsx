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

import WidgetPreview, { PartialWidget } from '../WidgetPreview';
import styles from './styles.scss';

interface WidgetProps {
    isSecondary: boolean;
    widget: PartialWidget;
    clientId: string;
    onWidgetValueChange: (value: unknown, widgetName: string) => void;
    onWidgetEditClick: (widgetName: string) => void;
    onWidgetDeleteClick: (widgetName: string) => void;
    showWidgetEdit: boolean;
    showWidgetDelete: boolean;
    editMode: boolean;
    setNodeRef?: NodeRef;
    attributes?: Attributes;
    listeners?: Listeners;
    style?: React.CSSProperties;
}

function Widget(props: WidgetProps) {
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

const widgetKeySelector = (d: PartialWidget) => d.clientId;

interface Props<T> {
    name: T;
    widgets: PartialWidget[] | undefined;
    onWidgetDelete?: (widgetId: string, name: T) => void;
    onWidgetEdit?: (widgetId: string, name: T) => void;
    onWidgetOrderChange: (widgets: PartialWidget[]) => void;
    editMode?: boolean;
    isSecondary?: boolean;
}

function Canvas<T>(props: Props<T>) {
    const {
        name,
        widgets,
        editMode = false,
        onWidgetDelete,
        onWidgetEdit,
        onWidgetOrderChange,
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
            if (onWidgetDelete) {
                onWidgetDelete(widgetId, name);
            }
        },
        [onWidgetDelete, name],
    );
    const handleWidgetEditClick = useCallback(
        (widgetId: string) => {
            if (onWidgetEdit) {
                onWidgetEdit(widgetId, name);
            }
        },
        [onWidgetEdit, name],
    );

    const widgetRendererParams = useCallback((key, data) => ({
        clientId: key,
        isSecondary,
        widget: data,
        onWidgetValueChange: handleWidgetValueChange,
        showWidgetEdit: !!onWidgetEdit,
        onWidgetEditClick: handleWidgetEditClick,
        showWidgetDelete: !!onWidgetDelete,
        onWidgetDeleteClick: handleWidgetDeleteClick,
        editMode,
    }), [
        isSecondary,
        handleWidgetValueChange,
        handleWidgetEditClick,
        editMode,
        onWidgetEdit,
        onWidgetDelete,
        handleWidgetDeleteClick,
    ]);

    return (
        <SortableList
            className={styles.canvas}
            name="widgets"
            onChange={onWidgetOrderChange}
            data={widgets}
            keySelector={widgetKeySelector}
            renderer={Widget}
            direction="rect"
            rendererParams={widgetRendererParams}
            showDragOverlay
        />
    );
}
export default Canvas;
