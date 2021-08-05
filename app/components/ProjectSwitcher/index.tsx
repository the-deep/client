import React, { useCallback } from 'react';
import {
    generatePath,
    useRouteMatch,
    useHistory,
} from 'react-router-dom';

import ProjectSelectInput from '#components/ProjectSelectInput';
import ProjectContext from '#base/context/ProjectContext';

function ProjectSwitcher() {
    const { project } = React.useContext(ProjectContext);

    const { path, params } = useRouteMatch();
    const { push } = useHistory();

    const handleChange = useCallback(
        (value: string) => {
            const newPath = generatePath(path, { ...params, projectId: value });
            push(newPath);
        },
        [path, params, push],
    );

    return (
        <ProjectSelectInput
            name="project"
            value={project?.id}
            onChange={handleChange}
            options={project ? [project] : undefined}
            variant="general"
            nonClearable
        />
    );
}
export default ProjectSwitcher;
