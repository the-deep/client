import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Button,
    ExpandableContainer,
    Element,
} from '@the-deep/deep-ui';

import { Types } from '#types/newAnalyticalFramework';
import { PartialWidget } from '#components/framework/AttributeInput';
import styles from './styles.css';

const partialWidgets: PartialWidget[] = [
    {
        widgetId: 'TEXT',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'NUMBER',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'DATE',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'DATE_RANGE',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'TIME',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'TIME_RANGE',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'MATRIX1D',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'MATRIX2D',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'SCALE',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'SELECT',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'MULTISELECT',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'ORGANIGRAM',
        key: 'random',
        clientId: 'random',
        order: -1,
        width: 'FULL',
    },
    {
        widgetId: 'GEO',
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
    previewContainerClassName?: string;
    disabled?: boolean;
    accented?: boolean;
}

function AddItem<T extends string | number | undefined>(props: AddItemProps<T>) {
    const {
        className,
        onAddClick,
        label,
        preview,
        previewContainerClassName,
        name,
        disabled,
        accented,
    } = props;

    return (
        <div
            className={_cs(
                styles.addItem,
                accented && styles.accented,
                className,
            )}
        >
            <Element
                className={styles.title}
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
            </Element>
            {preview && (
                <div className={previewContainerClassName}>
                    {preview}
                </div>
            )}
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
                        name="MATRIX1D"
                        // FIXME: use strings
                        label="1D Matrix"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                    <AddItem
                        name="MATRIX2D"
                        // FIXME: use strings
                        label="2D Matrix"
                        onAddClick={handleAddClick}
                        disabled={disabled || widgetsDisabled}
                    />
                </>
            )}
            <ExpandableContainer
                // FIXME: use strings
                heading="More Widgets"
                headingSize="extraSmall"
                headerClassName={styles.header}
                contentClassName={styles.moreWidgetList}
                // eslint-disable-next-line react/destructuring-assignment
                defaultVisibility={!!props.sectionsDisabled}
                className={styles.widgets}
                spacing="compact"
            >
                <AddItem
                    name="TEXT"
                    // FIXME: use strings
                    label="Text"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="NUMBER"
                    // FIXME: use strings
                    label="Number"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="DATE"
                    // FIXME: use strings
                    label="Date"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="DATE_RANGE"
                    // FIXME: use strings
                    label="Date Range"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="TIME"
                    // FIXME: use strings
                    label="Time"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="TIME_RANGE"
                    // FIXME: use strings
                    label="Time Range"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="SCALE"
                    // FIXME: use strings
                    label="Scale"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="SELECT"
                    // FIXME: use strings
                    label="Single Select"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="MULTISELECT"
                    // FIXME: use strings
                    label="Multi Select"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="ORGANIGRAM"
                    // FIXME: use strings
                    label="Organigram"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
                <AddItem
                    name="GEO"
                    // FIXME: use strings
                    label="Geo"
                    onAddClick={handleAddClick}
                    disabled={disabled || widgetsDisabled}
                />
            </ExpandableContainer>
        </div>
    );
}

export default WidgetList;
