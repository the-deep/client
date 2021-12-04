import React from 'react';
import { ButtonLikeLink, ButtonLikeLinkProps } from '@the-deep/deep-ui';

import useRouteMatching, {
    RouteData,
    Attrs,
} from '#base/hooks/useRouteMatching';

export type Props = Omit<ButtonLikeLinkProps, 'to'> & {
    route: RouteData;
    // eslint-disable-next-line @typescript-eslint/ban-types
    state?: object;
    attrs?: Attrs;
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
        ...otherProps
    } = props;

    const routeData = useRouteMatching(route, attrs);
    if (!routeData) {
        return null;
    }

    return (
        <ButtonLikeLink
            {...otherProps}
            to={{ pathname: routeData.to, state, hash }}
        >
            {children ?? routeData.children}
        </ButtonLikeLink>
    );
}

export default SmartButtonLikeLink;
