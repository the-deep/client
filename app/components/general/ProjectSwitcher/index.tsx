import React, { useCallback } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import {
    generatePath,
    useRouteMatch,
    useHistory,
} from 'react-router-dom';

import ProjectSelectInput from '#components/selections/ProjectSelectInput';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import ProjectContext from '#base/context/ProjectContext';
import routes from '#base/configs/routes';

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
        <>
            <ProjectSelectInput
                name="project"
                value={project?.id}
                onChange={handleChange}
                options={project ? [project] : undefined}
                variant="general"
                nonClearable
            />
            <SmartButtonLikeLink
                // FIXME: use SmartQuickButtonLikeLink
                variant="secondary"
                route={routes.projectEdit}
                title="Edit Project"
            >
                <FiEdit2 />
            </SmartButtonLikeLink>
        </>
    );
}
export default ProjectSwitcher;
