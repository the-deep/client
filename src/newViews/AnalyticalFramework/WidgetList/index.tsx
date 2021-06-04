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
    },
    {
        type: 'date',
        clientId: 'random',
    },
    {
        type: 'matrix-1d',
        clientId: 'random',
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
        <div className={_cs(className, styles.addItem)}>
            <Header
                className={styles.header}
                heading={label}
                headingSize="small"
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
            <div className={styles.childrenContainer}>
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
    onSectionsEdit: () => void;
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
                <AddItem
                    name="section"
                    // FIXME: use strings
                    label="Sections"
                    onAddClick={props.onSectionsEdit}
                />
            )}
            <ExpandableContainer
                // FIXME: use strings
                heading="Widgets"
                childrenContainerClassName={styles.children}
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
                    name="date"
                    // FIXME: use strings
                    label="Date Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
                <AddItem
                    name="matrix-1d"
                    // FIXME: use strings
                    label="Matrix1d Widget"
                    className={styles.addMoreItem}
                    onAddClick={handleAddClick}
                />
            </ExpandableContainer>
        </div>
    );
}

export default WidgetList;
