import Request from '#utils/Request';
import {
    createUrlForProjectJoin,
    createParamsForProjectJoin,
    // transformResponseErrorToFormError,
} from '#rest';

export default class ProjectJoinRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingProjectJoin: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectJoin: false });
    }

    handleSuccess = () => {
        this.parent.setProjectJoin({
            projectId: this.projectId,
            isJoining: true,
        });
    }

    init = ({ projectId }) => {
        const url = createUrlForProjectJoin(projectId);
        this.projectId = projectId;

        this.createDefault({
            url,
            params: createParamsForProjectJoin,
        });
    }
}

