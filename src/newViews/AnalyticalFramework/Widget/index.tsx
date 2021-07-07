import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Header } from '@the-deep/deep-ui';

import { NodeRef } from '#newComponents/ui/SortableList';

import styles from './styles.scss';

export interface Props {
    title: string | undefined;
    className?: string;
    headerClassName?: string;

    nodeRef?: NodeRef;
    rootStyle?: React.CSSProperties;

    actions?: React.ReactNode,
    actionsContainerClassName?: string;

    children?: React.ReactNode,
    childrenContainerClassName?: string;

    disabled?: boolean;
    readOnly?: boolean;
}

function WidgetWrapper(props: Props) {
    const {
        className,
        title,
        actions,
        children,
        headerClassName,
        actionsContainerClassName,
        childrenContainerClassName,
        nodeRef,
        rootStyle,
    } = props;

    return (
        <div
            className={_cs(className, styles.widget)}
            style={rootStyle}
            ref={nodeRef}
        >
            <Header
                // FIXME: use strings
                heading={title ?? 'Unnamed'}
                className={_cs(headerClassName, styles.header)}
                headingSize="small"
                actionsContainerClassName={_cs(actionsContainerClassName, styles.actions)}
                actions={actions}
            />
            <div className={childrenContainerClassName}>
                {children}
            </div>
        </div>
    );
}

export default WidgetWrapper;
