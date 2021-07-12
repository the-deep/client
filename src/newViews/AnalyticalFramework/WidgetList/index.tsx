import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Header,
    QuickActionButton,
    ExpandableContainer,
} from '@the-deep/deep-ui';

import { Types } from '../types';
import { PartialWidget } from '../WidgetPreview';
import styles from './styles.scss';

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
    // NOTE: Send Icon/SVG of widget type in children
    children?: React.ReactNode;
}

function AddItem<T extends string | number | undefined>(props: AddItemProps<T>) {
    const {
        className,
        onAddClick,
        label,
        children,
        name,
    } = props;

    return (
        <div className={_cs(className)}>
            <Header
                className={styles.header}
                heading={label}
                headingSize="extraSmall"
                actions={(
                    <QuickActionButton
                        name={name}
                        variant="action"
                        onClick={onAddClick}
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            />
            <div>
                {children}
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
            const widget = partialWidgets.find(item => item.type === name);
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
            {!props.sectionsDisabled && (
                <>
                    <AddItem
                        name="section"
                        // FIXME: use strings
                        label="Sections"
                        className={styles.addMoreItem}
                        onAddClick={props.onSectionsAdd}
                    />
                    <AddItem
                        name="matrix-1d"
                        // FIXME: use strings
                        label="Matrix1d Widget"
                        className={styles.addMoreItem}
                        onAddClick={handleAddClick}
                    />
                    <AddItem
                        name="matrix-2d"
                        // FIXME: use strings
                        label="Matrix2d Widget"
                        className={styles.addMoreItem}
                        onAddClick={handleAddClick}
                    />
                </>
            )}
            <ExpandableContainer
                // FIXME: use strings
                heading="Widgets"
                contentClassName={styles.children}
                defaultVisibility={!!props.sectionsDisabled}
            >
                <AddItem
                    name="text"
                    // FIXME: use strings
                    label="Text Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="number"
                    // FIXME: use strings
                    label="Number Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="date"
                    // FIXME: use strings
                    label="Date Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="date-range"
                    // FIXME: use strings
                    label="Date Range Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="time"
                    // FIXME: use strings
                    label="Time Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="time-range"
                    // FIXME: use strings
                    label="Time Range Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="scale"
                    // FIXME: use strings
                    label="Scale Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="single-select"
                    // FIXME: use strings
                    label="Single Select Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="multi-select"
                    // FIXME: use strings
                    label="Multi Select Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
            </ExpandableContainer>
        </div>
    );
}

export default WidgetList;
