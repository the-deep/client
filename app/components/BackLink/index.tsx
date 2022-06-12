import React, { useCallback } from 'react';
import {
    Link,
    LinkProps,
} from '@the-deep/deep-ui';

interface Props extends Omit<LinkProps, 'to'> {
    defaultLink?: string;
    children?: React.ReactNode;
}

function BackLink(props: Props) {
    const {
        className,
        defaultLink,
        children,
        ...otherProps
    } = props;

    const handleBackLinkClick = useCallback((e) => {
        if (window.history.length > 1) {
            e.preventDefault();
            e.stopPropagation();
            window.history.back();
        }
    }, []);

    return (
        <Link
            className={className}
            to={defaultLink || '/'}
            onClick={handleBackLinkClick}
            {...otherProps}
        >
            {children}
        </Link>
    );
}

export default BackLink;
