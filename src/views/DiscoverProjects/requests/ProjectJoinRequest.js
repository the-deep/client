import Request from '#utils/Request';
import {
    createUrlForProjectJoin,
    createParamsForProjectJoin,
    // transformResponseErrorToFormError,
} from '#rest';
import notify from '#notify';
import _ts from '#ts';

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
        notify.send({
            title: _ts('discoverProjects', 'discoverProjectsNotificationTitle'),
            type: notify.type.SUCCESS,
            message: _ts(
                'discoverProjects',
                'projectJoinNotification',
                { projectName: this.projectTitle },
            ),
            duration: notify.duration.MEDIUM,
        });
    }

    init = ({ projectId, projectTitle }) => {
        const url = createUrlForProjectJoin(projectId);
        this.projectId = projectId;
        this.projectTitle = projectTitle;

        this.createDefault({
            url,
            params: createParamsForProjectJoin,
        });
    }
}

