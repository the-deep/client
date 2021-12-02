import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Header } from '@the-deep/deep-ui';

import ErrorBoundary from '#base/components/ErrorBoundary';

import styles from './styles.css';

export interface Props {
    title: string | undefined;
    className?: string;
    headerClassName?: string;

    actions?: React.ReactNode,
    actionsContainerClassName?: string;

    icons?: React.ReactNode;
    iconsContainerClassName?: string;

    children?: React.ReactNode,
    childrenContainerClassName?: string;

    disabled?: boolean;
    readOnly?: boolean;

    error: unknown;
}

function WidgetWrapper(props: Props) {
    const {
        className,
        title,
        actions,
        icons,
        children,
        headerClassName,
        actionsContainerClassName,
        iconsContainerClassName,
        childrenContainerClassName,
    } = props;

    return (
        <div
            className={_cs(
                className,
                styles.widgetWrapper,
            )}
        >
            <Header
                // FIXME: use strings
                heading={title ?? 'Unnamed'}
                className={headerClassName}
                headingSize="extraSmall"
                headingSectionClassName={styles.header}
                actionsContainerClassName={actionsContainerClassName}
                actions={actions}
                iconsContainerClassName={iconsContainerClassName}
                icons={icons}
            />
            <div className={childrenContainerClassName}>
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </div>
        </div>
    );
}

export default WidgetWrapper;
