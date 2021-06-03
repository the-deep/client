import React, { useCallback } from 'react';
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
    onWidgetDelete: (widgetId: string, name: T) => void;
    onWidgetEdit: (widgetId: string, name: T) => void;
    editMode?: boolean;
}

function Canvas<T>(props: Props<T>) {
    const {
        name,
        widgets,
        editMode,
        onWidgetDelete,
        onWidgetEdit,
    } = props;

    const handleWidgetValueChange = useCallback(
        (value: unknown, widgetName: string) => {
            console.warn(`Trying to edit widget ${widgetName} from section ${name}`);
        },
        [name],
    );
    const handleWidgetDeleteClick = useCallback(
        (widgetId: string) => {
            onWidgetDelete(widgetId, name);
        },
        [name],
    );
    const handleWidgetEditClick = useCallback(
        (widgetId: string) => {
            onWidgetEdit(widgetId, name);
        },
        [name],
    );

    return (
        <>
            {widgets?.map(widget => (
                <WidgetPreview
                    className={styles.widget}
                    key={widget.clientId}
                    name={widget.clientId}
                    value={undefined}
                    onChange={handleWidgetValueChange}
                    widget={widget}
                    readOnly
                    actions={(
                        <>
                            <QuickActionButton
                                name={widget.clientId}
                                onClick={handleWidgetEditClick}
                                // FIXME: use translation
                                title="Edit Widget"
                                disabled={editMode}
                            >
                                <IoCreateOutline />
                            </QuickActionButton>
                            <QuickActionButton
                                name={widget.clientId}
                                onClick={handleWidgetDeleteClick}
                                // FIXME: use translation
                                title="Delete Widget"
                                disabled={editMode}
                            >
                                <IoTrash />
                            </QuickActionButton>
                        </>
                    )}
                />
            ))}
        </>
    );
}
export default Canvas;
