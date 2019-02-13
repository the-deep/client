import { getElementAround } from '@togglecorp/fujs';

// eslint-disable-next-line import/prefer-default-export
export const getNewActiveProjectId = (projects, currentActiveProject) => {
    const projectIndex = projects.findIndex(
        project => project.id === currentActiveProject,
    );
    if (projectIndex !== -1) {
        return (
            getElementAround(
                projects,
                projectIndex,
            ) || {}
        ).id;
    }
    return null;
};
