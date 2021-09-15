import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ErrorBoundary from '#base/components/ErrorBoundary';

import styles from './styles.css';

export interface Props {
    title: string | undefined;
    className?: string;
    headerClassName?: string;

    children?: React.ReactNode,
    childrenContainerClassName?: string;

    disabled?: boolean;
    readOnly?: boolean;
}

function WidgetWrapper(props: Props) {
    const {
        className,
        title,
        children,
        headerClassName,
        childrenContainerClassName,
        readOnly,
    } = props;

    return (
        <div className={_cs(className, styles.widgetWrapper)}>
            <div
                className={_cs(headerClassName, styles.header)}
                // FIXME: use strings
            >
                {title ?? 'Unnamed'}
            </div>
            <div
                className={_cs(
                    childrenContainerClassName,
                    styles.children,
                    readOnly && styles.readOnly,
                )}
            >
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </div>
        </div>
    );
}

export default WidgetWrapper;
