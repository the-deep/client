import React from 'react';
import { QuickActionLink, QuickActionLinkProps } from '@the-deep/deep-ui';

import useRouteMatching, {
    RouteData,
    Attrs,
} from '#base/hooks/useRouteMatching';

export type Props = Omit<QuickActionLinkProps, 'to'> & {
    route: RouteData;
    attrs?: Attrs;
    children?: React.ReactNode;
};

function SmartQuickActionLink(props: Props) {
    const {
        route,
        attrs,
        children,
        ...otherProps
    } = props;

    const routeData = useRouteMatching(route, attrs);
    if (!routeData) {
        return null;
    }

    return (
        <QuickActionLink
            {...otherProps}
            to={routeData.to}
        >
            {children ?? routeData.children}
        </QuickActionLink>
    );
}

export default SmartQuickActionLink;
