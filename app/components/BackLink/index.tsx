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
        e.preventDefault();
        e.stopPropagation();
        window.history.back();
        // NOTE: Don't know if this is required
        return false;
    }, []);

    return (
        <Link
            className={className}
            to={defaultLink || '/'}
            // onClick={isFirstPage ? undefined : handleBackLinkClick}
            onClick={handleBackLinkClick}
            {...otherProps}
        >
            {children}
        </Link>
    );
}

export default BackLink;
