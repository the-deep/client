import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Button,
    ExpandableContainer,
    ElementFragments,
} from '@the-deep/deep-ui';

import { Types } from '#types/newAnalyticalFramework';
import { PartialWidget } from '../Canvas/WidgetPreview';
import styles from './styles.css';

const partialWidgets: PartialWidget[] = [
    {
        widgetId: 'TEXTWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'NUMBERWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'DATEWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'DATERANGEWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'TIMEWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'TIMERANGEWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'MATRIX1DWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'MATRIX2DWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'SCALEWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'SELECTWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        widgetId: 'MULTISELECTWIDGET',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
];

interface AddItemProps<T extends string | number | undefined> {
    name: T;
    className?: string;
    label: string;
    onAddClick: (name: T) => void;
    preview?: React.ReactNode;
    disabled?: boolean;
}

function AddItem<T extends string | number | undefined>(props: AddItemProps<T>) {
    const {
        className,
        onAddClick,
        label,
        preview,
        name,
        disabled,
    } = props;

    return (
        <div className={_cs(styles.addItem, className)}>
            <div className={styles.title}>
                <ElementFragments
                    actions={(
                        <Button
                            name={name}
                            variant="action"
                            onClick={onAddClick}
                            disabled={disabled}
                        >
                            <IoAdd className={styles.addIcon} />
                        </Button>
                    )}
                >
                    {label}
                </ElementFragments>
            </div>
            <div>
                {preview}
            </div>
        </div>
    );
}

type Props = {
    className?: string;
    onWidgetAdd: (widget: PartialWidget) => void;
    disabled?: boolean;
} & ({
    sectionsDisabled: true;
} | {
    onSectionsAdd: () => void;
    sectionsDisabled?: false;
})

function WidgetList(props: Props) {
    const {
        className,
        onWidgetAdd,
        disabled,
    } = props;

    const handleAddClick = useCallback(
        (name: Types) => {
            const widget = partialWidgets.find((item) => item.widgetId === name);
            if (widget) {
                onWidgetAdd({
                    ...widget,
                    clientId: randomString(),
                });
            }
        },
        [onWidgetAdd],
    );

    return (
        <div className={_cs(className, styles.widgetList)}>
            {/* eslint-disable-next-line react/destructuring-assignment */}
            {!props.sectionsDisabled && (
                <>
                    <AddItem
                        name="section"
                        // FIXME: use strings
                        label="Sections"
                        // eslint-disable-next-line react/destructuring-assignment
                        onAddClick={props.onSectionsAdd}
                        disabled={disabled}
                    />
                    <AddItem
                        name="MATRIX1DWIDGET"
                        // FIXME: use strings
                        label="Matrix1d"
                        onAddClick={handleAddClick}
                        disabled={disabled}
                    />
                    <AddItem
                        name="MATRIX2DWIDGET"
                        // FIXME: use strings
                        label="Matrix2d"
                        onAddClick={handleAddClick}
                        disabled={disabled}
                    />
                </>
            )}
            <ExpandableContainer
                // FIXME: use strings
                heading="Widgets"
                contentClassName={styles.children}
                // eslint-disable-next-line react/destructuring-assignment
                defaultVisibility={!!props.sectionsDisabled}
                className={styles.widgets}
                horizontallyCompactContent
            >
                <AddItem
                    name="TEXTWIDGET"
                    // FIXME: use strings
                    label="Text"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="NUMBERWIDGET"
                    // FIXME: use strings
                    label="Number"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="DATEWIDGET"
                    // FIXME: use strings
                    label="Date"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="DATERANGEWIDGET"
                    // FIXME: use strings
                    label="Date Range"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="TIMEWIDGET"
                    // FIXME: use strings
                    label="Time"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="TIMERANGEWIDGET"
                    // FIXME: use strings
                    label="Time Range"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="SCALEWIDGET"
                    // FIXME: use strings
                    label="Scale"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="SELECTWIDGET"
                    // FIXME: use strings
                    label="Single Select"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
                <AddItem
                    name="MULTISELECTWIDGET"
                    // FIXME: use strings
                    label="Multi Select"
                    onAddClick={handleAddClick}
                    disabled={disabled}
                />
            </ExpandableContainer>
        </div>
    );
}

export default WidgetList;
