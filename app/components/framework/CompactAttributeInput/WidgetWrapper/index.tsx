import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import ErrorBoundary from '#base/components/ErrorBoundary';

import styles from './styles.css';

interface BaseProps {
    className?: string;
    headerClassName?: string;

    children?: React.ReactNode,
    childrenContainerClassName?: string;

    disabled?: boolean;
    readOnly?: boolean;

    error: unknown;
}

export type Props = BaseProps & ({
    title: string | undefined;
    hideTitle?: false;
} | {
    title?: string;
    hideTitle: true;
});

function WidgetWrapper(props: Props) {
    const {
        className,
        title,
        children,
        headerClassName,
        childrenContainerClassName,
        hideTitle,
        readOnly,
        error,
    } = props;

    return (
        <div
            className={_cs(
                className,
                styles.widgetWrapper,
                isDefined(error) && styles.errored,
            )}
        >
            {!hideTitle && (
                <div
                    className={_cs(headerClassName, styles.header)}
                    // FIXME: use strings
                >
                    {title ?? 'Unnamed'}
                </div>
            )}
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
