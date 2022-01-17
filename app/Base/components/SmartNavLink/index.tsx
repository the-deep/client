import React, { useCallback } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { Border } from '@the-deep/deep-ui';

import useRouteMatching, {
    RouteData,
    Attrs,
} from '#base/hooks/useRouteMatching';

import styles from './styles.css';

export type Props = Omit<NavLinkProps, 'to'> & {
    route: RouteData;
    attrs?: Attrs;
    children?: React.ReactNode;
};

function SmartNavLink(props: Props) {
    const {
        route,
        attrs,
        children,
        className,
        activeClassName,
        ...otherProps
    } = props;

    const classNameCallback = useCallback(
        (active: boolean) => _cs(
            styles.smartNavLink,
            typeof className === 'function' ? className(active) : className,
        ),
        [className],
    );

    const routeData = useRouteMatching(route, attrs);
    if (!routeData) {
        return null;
    }

    return (
        <NavLink
            {...otherProps}
            to={routeData.to}
            className={classNameCallback}
            activeClassName={_cs(styles.active, activeClassName)}
        >
            {children ?? routeData.children}
            <Border
                active
                className={styles.border}
                transparent
            />
        </NavLink>
    );
}

export default SmartNavLink;
