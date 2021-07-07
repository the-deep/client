import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import {
    Link,
    LinkProps,
} from '@the-deep/deep-ui';

import { routeIsFirstPageSelector } from '#redux';

import {
    AppState,
} from '#typings';

const mapStateToProps = (state: AppState) => ({
    isFirstPage: routeIsFirstPageSelector(state),
});

interface Props extends Omit<LinkProps, 'to'> {
    isFirstPage: boolean;
    defaultLink?: string;
    children?: React.ReactNode;
}

function BackLink(props: Props) {
    const {
        className,
        isFirstPage,
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
            onClick={isFirstPage ? undefined : handleBackLinkClick}
            {...otherProps}
        >
            {children}
        </Link>
    );
}

export default connect(mapStateToProps)(BackLink);
