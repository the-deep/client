import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    IoCreateOutline,
    IoTrash,
} from 'react-icons/io5';

import WidgetPreview, { PartialWidget } from '../WidgetPreview';
import styles from './styles.scss';

interface Props<T> {
    name: T;
    widgets: PartialWidget[] | undefined;
    onWidgetDelete?: (widgetId: string, name: T) => void;
    onWidgetEdit?: (widgetId: string, name: T) => void;
    editMode?: boolean;
    isSecondary?: boolean;
}

function Canvas<T>(props: Props<T>) {
    const {
        name,
        widgets,
        editMode,
        onWidgetDelete,
        onWidgetEdit,
        isSecondary,
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

    return (
        <div className={styles.canvas}>
            {widgets?.map(widget => (
                <WidgetPreview
                    className={_cs(
                        styles.widget,
                        isSecondary && widget?.width === 'half' && styles.halfWidget,
                    )}
                    key={widget.clientId}
                    name={widget.clientId}
                    value={undefined}
                    onChange={handleWidgetValueChange}
                    widget={widget}
                    readOnly
                    actions={(
                        <>
                            {onWidgetEdit && (
                                <QuickActionButton
                                    name={widget.clientId}
                                    onClick={handleWidgetEditClick}
                                    // FIXME: use translation
                                    title="Edit Widget"
                                    disabled={editMode}
                                >
                                    <IoCreateOutline />
                                </QuickActionButton>
                            )}
                            {onWidgetDelete && (
                                <QuickActionButton
                                    name={widget.clientId}
                                    onClick={handleWidgetDeleteClick}
                                    // FIXME: use translation
                                    title="Delete Widget"
                                    disabled={editMode}
                                >
                                    <IoTrash />
                                </QuickActionButton>
                            )}
                        </>
                    )}
                />
            ))}
        </div>
    );
}
export default Canvas;
