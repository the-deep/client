import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Button,
    ExpandableContainer,
    ElementFragments,
} from '@the-deep/deep-ui';

import { Types } from '#types/newAnalyticalFramework';
import { PartialWidget } from '../WidgetPreview';
import styles from './styles.css';

const partialWidgets: PartialWidget[] = [
    {
        type: 'text',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'number',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'date',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'date-range',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'time',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'time-range',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'matrix-1d',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'matrix-2d',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'scale',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'single-select',
        clientId: 'random',
        order: -1,
        width: 'full',
    },
    {
        type: 'multi-select',
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
}

function AddItem<T extends string | number | undefined>(props: AddItemProps<T>) {
    const {
        className,
        onAddClick,
        label,
        preview,
        name,
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
    } = props;

    const handleAddClick = useCallback(
        (name: Types) => {
            const widget = partialWidgets.find((item) => item.type === name);
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
                    />
                    <AddItem
                        name="matrix-1d"
                        // FIXME: use strings
                        label="Matrix1d Widget"
                        onAddClick={handleAddClick}
                    />
                    <AddItem
                        name="matrix-2d"
                        // FIXME: use strings
                        label="Matrix2d Widget"
                        onAddClick={handleAddClick}
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
                    name="text"
                    // FIXME: use strings
                    label="Text Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="number"
                    // FIXME: use strings
                    label="Number Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="date"
                    // FIXME: use strings
                    label="Date Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="date-range"
                    // FIXME: use strings
                    label="Date Range Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="time"
                    // FIXME: use strings
                    label="Time Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="time-range"
                    // FIXME: use strings
                    label="Time Range Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="scale"
                    // FIXME: use strings
                    label="Scale Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="single-select"
                    // FIXME: use strings
                    label="Single Select Widget"
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="multi-select"
                    // FIXME: use strings
                    label="Multi Select Widget"
                    onAddClick={handleAddClick}
                />
            </ExpandableContainer>
        </div>
    );
}

export default WidgetList;
