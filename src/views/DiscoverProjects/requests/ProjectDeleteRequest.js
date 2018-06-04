import Request from '#utils/Request';
import {
    createUrlForProject,
    createParamsForDelete,
    // transformResponseErrorToFormError,
} from '#rest';

export default class ProjectDeleteRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingProjectDelete: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectDelete: false });
    }

    handleSuccess = () => {
        this.parent.deleteProject({ projectId: this.projectId });
    }

    create = (projectId) => {
        const url = createUrlForProject(projectId);
        this.projectId = projectId;

        this.createDefault({
            url,
            createParams: createParamsForDelete,
        });
    }
}

