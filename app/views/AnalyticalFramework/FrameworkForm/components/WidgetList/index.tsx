import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Button,
    ExpandableContainer,
    ElementFragments,
} from '@the-deep/deep-ui';

import { Types } from '#types/newAnalyticalFramework';
import { PartialWidget } from '#components/framework/WidgetPreview';
import styles from './styles.css';

const partialWidgets: PartialWidget[] = [
    {
        widgetId: 'TEXTWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'NUMBERWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'DATEWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'DATERANGEWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'TIMEWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'TIMERANGEWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'MATRIX1DWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'MATRIX2DWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'SCALEWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'SELECTWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'MULTISELECTWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'ORGANIGRAMWIDGET',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
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
    widgetsDisabled?: boolean;
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
        widgetsDisabled,
    } = props;

    const handleAddClick = useCallback(
        (name: Types) => {
            const widget = partialWidgets.find((item) => item.widgetId === name);
            if (widget) {
                const key = randomString();
                onWidgetAdd({
                    ...widget,
                    clientId: key,
                    key,
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
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="MATRIX2DWIDGET"
                        // FIXME: use strings
                        label="Matrix2d"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
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
            >
                <div className={styles.moreWidgetsList}>
                    <AddItem
                        name="TEXTWIDGET"
                        // FIXME: use strings
                        label="Text"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="NUMBERWIDGET"
                        // FIXME: use strings
                        label="Number"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="DATEWIDGET"
                        // FIXME: use strings
                        label="Date"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="DATERANGEWIDGET"
                        // FIXME: use strings
                        label="Date Range"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="TIMEWIDGET"
                        // FIXME: use strings
                        label="Time"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="TIMERANGEWIDGET"
                        // FIXME: use strings
                        label="Time Range"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="SCALEWIDGET"
                        // FIXME: use strings
                        label="Scale"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="SELECTWIDGET"
                        // FIXME: use strings
                        label="Single Select"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="MULTISELECTWIDGET"
                        // FIXME: use strings
                        label="Multi Select"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="ORGANIGRAMWIDGET"
                        // FIXME: use strings
                        label="Organigram"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                </div>
            </ExpandableContainer>
        </div>
    );
}

export default WidgetList;
