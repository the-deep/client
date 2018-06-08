import Request from '#utils/Request';
import {
    createUrlForProjectJoinCancel,
    createParamsForProjectJoinCancel,
    // transformResponseErrorToFormError,
} from '#rest';

export default class ProjectJoinCancelRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingProjectJoin: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectJoin: false });
    }

    handleSuccess = () => {
        this.parent.setProjectJoin({
            projectId: this.projectId,
            isJoining: false,
        });
    }

    init = ({ projectId }) => {
        const url = createUrlForProjectJoinCancel(projectId);
        this.projectId = projectId;

        this.createDefault({
            url,
            params: createParamsForProjectJoinCancel,
        });
    }
}

