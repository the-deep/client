import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Header } from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    title: string | undefined;
    className?: string;
    headerClassName?: string;

    actions?: React.ReactNode,
    actionsContainerClassName?: string;

    children?: React.ReactNode,
    childrenContainerClassName?: string;

    disabled?: boolean;
    readOnly?: boolean;
}

// FIXME: Component name and file name should match
function WidgetWrapper(props: Props) {
    const {
        className,
        title,
        actions,
        children,
        headerClassName,
        actionsContainerClassName,
        childrenContainerClassName,
    } = props;

    return (
        <div
            // FIXME: Component name and style name should match
            className={_cs(className, styles.widget)}
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
