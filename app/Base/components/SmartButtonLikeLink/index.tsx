import React from 'react';
import { ButtonLikeLink, ButtonLikeLinkProps } from '@the-deep/deep-ui';

import useRouteMatching, {
    RouteData,
    Attrs,
} from '#base/hooks/useRouteMatching';

export type Props = Omit<ButtonLikeLinkProps, 'to'> & {
    route: RouteData;

    state?: object;
    attrs?: Attrs;
    search?: string;
    hash?: string;
    children?: React.ReactNode;
};

function SmartButtonLikeLink(props: Props) {
    const {
        route,
        attrs,
        children,
        state,
        hash,
        search,
        ...otherProps
    } = props;

    const routeData = useRouteMatching(route, attrs);
    if (!routeData) {
        return null;
    }

    return (
        <ButtonLikeLink
            {...otherProps}
            to={{
                pathname: routeData.to,
                state,
                hash,
                search,
            }}
        >
            {children ?? routeData.children}
        </ButtonLikeLink>
    );
}

export default SmartButtonLikeLink;
