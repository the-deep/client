import Request from '#utils/Request';

import {
    createParamsForProjectPut,
    createUrlForProject,
} from '#rest';

import _ts from '#ts';

export default class ProjectPutRequest extends Request {
    schemaName = 'projectPutResponse';

    handlePreLoad = () => {
        this.parent.setState({ pendingProjectPut: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectPut: false });
    }

    handleSuccess = (response) => {
        const { setProjectDetails } = this.parent;
        const project = { faramValues: response };

        setProjectDetails({
            project,
            projectId: this.projectId,
        });
    }

    handleFailure = (faramErrors) => {
        this.parent.setErrorProjectDetails({
            faramErrors,
            projectId: this.projectId,
        });
    }

    handleFatal = () => {
        this.parent.setErrorProjectDetails({
            faramErrors: { $internal: [_ts('project', 'projectPutFailure')] },
            projectId: this.projectId,
        });
    }

    init = (projectDetails, projectId) => {
        this.projectId = projectId;
        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectPut(projectDetails),
        });
    }
}
