import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Kraken,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { GrDrag } from 'react-icons/gr';
import {
    IoGitBranchOutline,
    IoCreateOutline,
    IoCopyOutline,
    IoTrashBinOutline,
} from 'react-icons/io5';
import { Error, getErrorObject, analyzeErrors } from '@togglecorp/toggle-form';

import SortableList, {
    Attributes,
    Listeners,
} from '#components/SortableList';
import NonFieldError from '#components/NonFieldError';
import { Widget } from '#types/newAnalyticalFramework';
import AttributeInput, { PartialWidget } from '#components/framework/AttributeInput';

import styles from './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

interface WidgetProps {
    isSecondary: boolean;
    widget: PartialWidget;
    clientId: string;
    onWidgetValueChange: (value: unknown, widgetName: string) => void;
    onWidgetEditClick: (widgetName: string) => void;
    onWidgetConditionEditClick: (widgetName: string) => void;
    onWidgetDeleteClick: (widgetName: string) => void;
    onWidgetCloneClick: (widgetName: string) => void;
    showWidgetEdit: boolean | undefined;
    showWidgetConditionEdit: boolean | undefined;
    showWidgetDelete: boolean | undefined;
    showWidgetClone: boolean | undefined;
    editMode: boolean | undefined;
    attributes?: Attributes;
    listeners?: Listeners;
    disabled?: boolean;
}

function AttributeInputWrapper(props: WidgetProps) {
    const {
        widget,
        clientId,
        onWidgetValueChange,
        onWidgetEditClick,
        onWidgetConditionEditClick,
        onWidgetCloneClick,
        showWidgetEdit,
        showWidgetConditionEdit,
        showWidgetClone,
        showWidgetDelete,
        editMode,
        onWidgetDeleteClick,
        attributes,
        listeners,
        disabled,
    } = props;

    return (
        <AttributeInput
            key={clientId}
            name={clientId}
            value={undefined}
            onChange={onWidgetValueChange}
            widget={widget}
            readOnly
            error={undefined}
            geoAreaOptions={undefined}
            onGeoAreaOptionsChange={noop}
            icons={widget.conditional && (
                <IoGitBranchOutline
                    title="This is a child widget"
                />
            )}
            actions={(
                <>
                    {showWidgetEdit && (
                        <QuickActionButton
                            className={styles.actionButton}
                            name={clientId}
                            onClick={onWidgetEditClick}
                            // FIXME: use translation
                            title="Edit Widget"
                            disabled={editMode || disabled}
                        >
                            <IoCreateOutline />
                        </QuickActionButton>
                    )}
                    {showWidgetConditionEdit && (
                        <QuickActionButton
                            className={styles.actionButton}
                            name={clientId}
                            onClick={onWidgetConditionEditClick}
                            // FIXME: use translation
                            title={widget.conditional ? 'Edit Widget Conditions' : 'Add Widget Conditions'}
                            disabled={editMode || disabled}
                        >
                            <IoGitBranchOutline />
                        </QuickActionButton>
                    )}
                    {showWidgetClone && (
                        <QuickActionButton
                            className={styles.actionButton}
                            name={clientId}
                            onClick={onWidgetCloneClick}
                            // FIXME: use translation
                            title="Clone Widget"
                            disabled={editMode || disabled}
                        >
                            <IoCopyOutline />
                        </QuickActionButton>
                    )}
                    {showWidgetDelete && (
                        <QuickActionButton
                            className={styles.actionButton}
                            name={clientId}
                            onClick={onWidgetDeleteClick}
                            // FIXME: use translation
                            title="Delete Widget"
                            disabled={editMode || disabled}
                        >
                            <IoTrashBinOutline />
                        </QuickActionButton>
                    )}
                    {!editMode && (
                        <QuickActionButton
                            className={styles.actionButton}
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
    error?: Error<Widget[]> | undefined;
} & ({
    editMode?: false;
    widgets: Widget[] | undefined;
    onWidgetOrderChange?: (widgets: Widget[]) => void;
    onWidgetDelete?: (widgetId: string, name: T) => void;
    onWidgetEdit?: (widgetId: string, name: T) => void;
    onWidgetConditionEdit?: (widgetId: string, name: T) => void;
    onWidgetClone?: (widgetId: string, name: T) => void;
} | {
    editMode: true;
    widgets: PartialWidget[] | undefined;
    onWidgetOrderChange?: never;
    onWidgetDelete?: never;
    onWidgetEdit?: never;
    onWidgetConditionEdit?: never;
    onWidgetClone?: never;
})

function Canvas<T>(props: Props<T>) {
    const {
        name,
        disabled,
        isSecondary = false,
        error: riskyError,
        editMode,
    } = props;

    const error = getErrorObject(riskyError);

    const handleWidgetValueChange = useCallback(
        (_: unknown, widgetName: string) => {
            // NOTE: when we start work on tagging page, we need to handle this
            // for preview page, we can skip this as the components are disabled any way
            // eslint-disable-next-line no-console
            console.error(`Trying to edit widget ${widgetName} from section ${name}`);
        },
        [name],
    );
    const handleWidgetDeleteClick = useCallback(
        (widgetId: string) => {
            if (editMode) {
                return;
            }
            // eslint-disable-next-line react/destructuring-assignment
            const handleWidgetDelete = props.onWidgetDelete;
            if (handleWidgetDelete) {
                handleWidgetDelete(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [editMode, props.onWidgetDelete, name],
    );
    const handleWidgetEditClick = useCallback(
        (widgetId: string) => {
            if (editMode) {
                return;
            }
            // eslint-disable-next-line react/destructuring-assignment
            const handleWidgetEdit = props.onWidgetEdit;
            if (handleWidgetEdit) {
                handleWidgetEdit(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [editMode, props.onWidgetEdit, name],
    );
    const handleWidgetConditionEditClick = useCallback(
        (widgetId: string) => {
            if (editMode) {
                return;
            }
            // eslint-disable-next-line react/destructuring-assignment
            const handleWidgetConditionEdit = props.onWidgetConditionEdit;
            if (handleWidgetConditionEdit) {
                handleWidgetConditionEdit(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [editMode, props.onWidgetConditionEdit, name],
    );

    const handleWidgetOrderChangeComplete = useCallback(
        (value: Widget[]) => {
            if (editMode) {
                return;
            }
            // eslint-disable-next-line react/destructuring-assignment
            const handleWidgetOrderChange = props.onWidgetOrderChange;
            if (handleWidgetOrderChange) {
                handleWidgetOrderChange(value);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [editMode, props.onWidgetOrderChange],
    );

    const handleWidgetCloneClick = useCallback(
        (widgetId: string) => {
            if (editMode) {
                return;
            }
            // eslint-disable-next-line react/destructuring-assignment
            const handleWidgetClone = props.onWidgetClone;
            if (handleWidgetClone) {
                handleWidgetClone(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [editMode, props.onWidgetClone, name],
    );

    const widgetRendererParams = useCallback((key: string, data: Widget | PartialWidget) => ({
        clientId: key,
        isSecondary,
        widget: data,
        onWidgetValueChange: handleWidgetValueChange,
        showWidgetEdit: !editMode,
        showWidgetConditionEdit: !editMode,
        onWidgetEditClick: handleWidgetEditClick,
        onWidgetConditionEditClick: handleWidgetConditionEditClick,
        showWidgetDelete: !editMode,
        onWidgetDeleteClick: handleWidgetDeleteClick,
        showWidgetClone: !editMode,
        onWidgetCloneClick: handleWidgetCloneClick,
        editMode,
        disabled,
    }), [
        isSecondary,
        handleWidgetValueChange,
        handleWidgetEditClick,
        handleWidgetConditionEditClick,
        handleWidgetDeleteClick,
        handleWidgetCloneClick,
        editMode,
        disabled,
    ]);

    const itemContainerParams = useCallback((key: string, data: Widget | PartialWidget) => ({
        className: _cs(
            styles.widgetContainer,
            analyzeErrors(error?.[key]) && styles.errored,
            data.width === 'HALF' && styles.halfWidget,
            data.conditional && styles.conditional,
        ),
    }), [
        error,
    ]);

    if (editMode) {
        return (
            <>
                <NonFieldError
                    error={error}
                />
                <SortableList
                    className={styles.canvas}
                    name="widgets"
                    // eslint-disable-next-line react/destructuring-assignment
                    data={props.widgets}
                    keySelector={partialWidgetKeySelector}
                    renderer={AttributeInputWrapper}
                    direction="rect"
                    rendererParams={widgetRendererParams}
                    itemContainerParams={itemContainerParams}
                    showDragOverlay
                />
            </>
        );
    }
    return (
        <>
            <NonFieldError
                error={error}
            />
            <SortableList
                className={styles.canvas}
                name="widgets"
                onChange={handleWidgetOrderChangeComplete}
                // eslint-disable-next-line react/destructuring-assignment
                data={props.widgets}
                keySelector={widgetKeySelector}
                renderer={AttributeInputWrapper}
                direction="rect"
                rendererParams={widgetRendererParams}
                itemContainerParams={itemContainerParams}
                showDragOverlay
                emptyIcon={(
                    <Kraken
                        variant="sleep"
                    />
                )}
                emptyMessage="No widgets found."
                messageShown
                messageIconShown
            />
        </>
    );
}
export default Canvas;
