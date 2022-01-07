import React, { useCallback } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { Border } from '@the-deep/deep-ui';

import useRouteMatching, {
    RouteData,
    Attrs,
} from '#base/hooks/useRouteMatching';

import styles from './styles.css';

export type Props = Omit<NavLinkProps, 'to' | 'children'> & {
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
        ...otherProps
    } = props;

    const classNameCallback = useCallback(
        ({ isActive }: { isActive: boolean }) => _cs(
            styles.smartNavLink,
            isActive && styles.active,
            typeof className === 'function' ? className({ isActive }) : className,
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
