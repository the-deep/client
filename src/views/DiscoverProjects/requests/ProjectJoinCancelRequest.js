import Request from '#utils/Request';
import {
    createUrlForProjectJoinCancel,
    createParamsForProjectJoinCancel,
    // transformResponseErrorToFormError,
} from '#rest';
import notify from '#notify';
import _ts from '#ts';

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
        notify.send({
            title: _ts('discoverProjects', 'discoverProjectsNotificationTitle'),
            type: notify.type.WARNING,
            message: _ts(
                'discoverProjects',
                'projectJoinCancelNotification',
                { projectName: this.projectTitle },
            ),
            duration: notify.duration.MEDIUM,
        });
    }

    init = ({ projectId, projectTitle }) => {
        const url = createUrlForProjectJoinCancel(projectId);
        this.projectId = projectId;
        this.projectTitle = projectTitle;

        this.createDefault({
            url,
            params: createParamsForProjectJoinCancel,
        });
    }
}

