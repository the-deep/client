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
        <div className={_cs(className, styles.widgetWrapper)}>
            <Header
                // FIXME: use strings
                heading={title ?? 'Unnamed'}
                className={headerClassName}
                headingSize="small"
                actionsContainerClassName={actionsContainerClassName}
                actions={actions}
            />
            <div className={childrenContainerClassName}>
                {children}
            </div>
        </div>
    );
}

export default WidgetWrapper;