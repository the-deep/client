import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import { Header } from '@the-deep/deep-ui';

import ErrorBoundary from '#base/components/ErrorBoundary';

import styles from './styles.css';

export interface Props {
    className?: string;
    headerClassName?: string;

    children?: React.ReactNode,
    childrenContainerClassName?: string;

    disabled?: boolean;
    readOnly?: boolean;
    headingDescription?: React.ReactNode;
    actions?: React.ReactNode;
    icons?: React.ReactNode;

    error: unknown;
    title: string | undefined;
}

function WidgetWrapper(props: Props) {
    const {
        className,
        title,
        children,
        headerClassName,
        headingDescription,
        childrenContainerClassName,
        readOnly,
        actions,
        icons,
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
            <Header
                className={_cs(styles.header, headerClassName)}
                icons={icons}
                headingClassName={_cs(headerClassName, styles.heading)}
                spacing="compact"
                actionsContainerClassName={styles.actions}
                heading={title ?? 'Unnamed'}
                actions={actions}
                description={headingDescription}
                inlineHeadingDescription
            />
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
