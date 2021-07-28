import { useContext } from 'react';

import UserContext from '#base/context/UserContext';
import { wrap } from '#base/utils/routes';

export interface Attrs {
    [key: string]: string | number | undefined;
}

export function reverseRoute(base: string, attrs?: Attrs) {
    return base.replace(
        /:(\w+)(?:\(.+?\))?\??/g,
        (_, groupMatch) => String(attrs?.[groupMatch] ?? ''),
    );
}

export type RouteData = ReturnType<typeof wrap>;

function useRouteMatching(route: RouteData, attrs?: Attrs) {
    const {
        user,
        authenticated,
    } = useContext(UserContext);

    const {
        checkPermissions,
        title,
        visibility,
        path,
    } = route;

    if (visibility === 'is-not-authenticated' && authenticated) {
        return undefined;
    }

    if (visibility === 'is-authenticated' && !authenticated) {
        return undefined;
    }

    if (visibility === 'is-authenticated' && authenticated && checkPermissions && (!user?.permissions || !checkPermissions(user.permissions))) {
        return undefined;
    }

    return {
        to: reverseRoute(path, attrs),
        children: title,
    };
}

export default useRouteMatching;
