import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
} from '@the-deep/deep-ui';
import { GrDrag } from 'react-icons/gr';
import {
    IoGitBranchOutline,
    IoCreateOutline,
    IoCopyOutline,
    IoTrashBinOutline,
    IoExtensionPuzzleOutline,
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
        <AttributeInput<string>
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
                <IoExtensionPuzzleOutline
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
    const handleWidgetConditionEditClick = useCallback(
        (widgetId: string) => {
            if (!props.editMode && props.onWidgetConditionEdit) {
                props.onWidgetConditionEdit(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [props.editMode, props.onWidgetConditionEdit, name],
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

    const handleWidgetCloneClick = useCallback(
        (widgetId: string) => {
            if (!props.editMode && props.onWidgetClone) {
                props.onWidgetClone(widgetId, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [props.editMode, props.onWidgetClone, name],
    );

    const widgetRendererParams = useCallback((key: string, data: Widget | PartialWidget) => ({
        clientId: key,
        isSecondary,
        widget: data,
        onWidgetValueChange: handleWidgetValueChange,
        showWidgetEdit: !props.editMode,
        showWidgetConditionEdit: !props.editMode,
        onWidgetEditClick: handleWidgetEditClick,
        onWidgetConditionEditClick: handleWidgetConditionEditClick,
        showWidgetDelete: !props.editMode,
        onWidgetDeleteClick: handleWidgetDeleteClick,
        showWidgetClone: !props.editMode,
        onWidgetCloneClick: handleWidgetCloneClick,
        editMode: props.editMode,
        disabled,
    }), [
        isSecondary,
        handleWidgetValueChange,
        handleWidgetEditClick,
        handleWidgetConditionEditClick,
        handleWidgetDeleteClick,
        handleWidgetCloneClick,
        // eslint-disable-next-line react/destructuring-assignment
        props.editMode,
        disabled,
    ]);

    const itemContainerParams = useCallback((key: string, data: Widget | PartialWidget) => ({
        className: _cs(
            styles.widgetContainer,
            analyzeErrors(error?.[key]) && styles.errored,
            data?.width === 'HALF' && styles.halfWidget,
        ),
    }), [
        error,
    ]);

    // eslint-disable-next-line react/destructuring-assignment
    if (props.editMode) {
        return (
            <>
                <NonFieldError
                    error={error}
                />
                <SortableList
                    className={styles.canvas}
                    name="widgets"
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
                onChange={handleWidgetOrderChange}
                // eslint-disable-next-line react/destructuring-assignment
                data={props.widgets}
                keySelector={widgetKeySelector}
                renderer={AttributeInputWrapper}
                direction="rect"
                rendererParams={widgetRendererParams}
                itemContainerParams={itemContainerParams}
                showDragOverlay
            />
        </>
    );
}
export default Canvas;
