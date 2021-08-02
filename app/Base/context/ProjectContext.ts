import { createContext } from 'react';

import { Project } from '#base/types/project';

export interface ProjectContextInterface {
    project: Project | undefined;
}

export const ProjectContext = createContext<ProjectContextInterface>({
    project: undefined,
});

export default ProjectContext;
