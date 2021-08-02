import { useContext } from 'react';

import UserContext from '#base/context/UserContext';
import ProjectContext from '#base/context/ProjectContext';
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
        authenticated,
    } = useContext(UserContext);
    const {
        project,
    } = useContext(ProjectContext);

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

    if (visibility === 'is-authenticated' && authenticated && checkPermissions && !checkPermissions(project)) {
        return undefined;
    }

    return {
        to: reverseRoute(path, attrs),
        children: title,
    };
}

export default useRouteMatching;
