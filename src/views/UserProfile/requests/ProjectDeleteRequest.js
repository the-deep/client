import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForProject,
    createParamsForProjectDelete,
} from '#rest';

export default class ProjectDeleteRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ deletePending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ deletePending: false });
    }

    handleSuccess = () => {
        const {
            userId,
            projectId,
        } = this.extraParent;
        this.parent.unsetProject({
            userId,
            projectId,
        });
        notify.send({
            title: _ts('userProfile', 'userProjectDelete'),
            type: notify.type.SUCCESS,
            message: _ts('userProfile', 'userProjectDeleteSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('userProfile', 'userProjectDelete'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userProjectDeleteFailure'),
            duration: notify.duration.SLOW,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userProfile', 'userProjectDelete'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userProjectDeleteFatal'),
            duration: notify.duration.SLOW,
        });
    }

    init = (projectId, userId) => {
        this.extraParent = { projectId, userId };

        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectDelete(),
        });
        return this;
    }
}
