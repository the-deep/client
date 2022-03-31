import { createContext } from 'react';

import { ProjectUser } from '#base/types/user';

export interface ProjectUserContextInterface {
    projectUser: ProjectUser | undefined;
    setProjectUser: React.Dispatch<React.SetStateAction<ProjectUser | undefined>>;
    authenticated: boolean,
}

export const ProjectUserContext = createContext<ProjectUserContextInterface>({
    authenticated: false,
    projectUser: undefined,
    setProjectUser: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setProjectUser called on ProjectUserContext without a provider', value);
    },
});

export default ProjectUserContext;
