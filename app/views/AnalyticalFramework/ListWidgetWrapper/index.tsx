import React from 'react';
import { _cs } from '@togglecorp/fujs';

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

function ListWidgetWrapper(props: Props) {
    const {
        className,
        title,
        children,
        headerClassName,
        childrenContainerClassName,
        readOnly,
    } = props;

    return (
        <div
            className={_cs(className, styles.listWidgetWrapper)}
        >
            <div
                // FIXME: use strings
                className={_cs(headerClassName, styles.header)}
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
                {children}
            </div>
        </div>
    );
}

export default ListWidgetWrapper;
