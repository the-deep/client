import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Header,
    QuickActionButton,
    ExpandableContainer,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

interface AddItemProps {
    className?: string;
    label: string;
    onAddClick: () => void;
    // NOTE: Send Icon/SVG of widget type in children
    children?: React.ReactNode;
}

function AddItem(props: AddItemProps) {
    const {
        className,
        onAddClick,
        label,
        children,
    } = props;

    return (
        <div className={_cs(className, styles.addItem)}>
            <Header
                className={styles.header}
                heading={label}
                headingSize="small"
                actions={(
                    <QuickActionButton
                        name={label}
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

interface Props {
    className?: string;
    onSectionsEditClick: () => void;
    onTextWidgetAddClick: () => void;
    onDateWidgetAddClick: () => void;
}

function WidgetList(props: Props) {
    const {
        className,
        onSectionsEditClick,
        onTextWidgetAddClick,
        onDateWidgetAddClick,
    } = props;

    return (
        <div className={_cs(className, styles.widgetList)}>
            <AddItem
                // FIXME: use strings
                label="Sections"
                onAddClick={onSectionsEditClick}
            />
            <ExpandableContainer
                // FIXME: use strings
                heading="More Widgets"
                childrenContainerClassName={styles.children}
            >
                <AddItem
                    // FIXME: use strings
                    label="Text Widget"
                    className={styles.addMoreItem}
                    onAddClick={onTextWidgetAddClick}
                />
                <AddItem
                    // FIXME: use strings
                    label="Date Widget"
                    className={styles.addMoreItem}
                    onAddClick={onDateWidgetAddClick}
                />
            </ExpandableContainer>
        </div>
    );
}

export default WidgetList;
