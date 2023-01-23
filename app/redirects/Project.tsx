import React from 'react';
import {
    Redirect,
    generatePath,
    useParams,
} from 'react-router-dom';

import routes from '#base/configs/routes';

interface ProjectParams {
    projectId: string | undefined;
}

function ProjectRedirect() {
    const { projectId } = useParams<ProjectParams>();
    const projectTaggingLink = (projectId) ? ({
        pathname: (generatePath(routes.tagging.path, { projectId })),
    }) : routes.fourHundredFour.path;

    return (
        <Redirect to={projectTaggingLink} />
    );
}

export default ProjectRedirect;
