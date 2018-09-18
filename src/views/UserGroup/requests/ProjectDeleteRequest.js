import {
    createUrlForProject,
    createParamsForProjectDelete,
} from '#rest';
import notify from '#notify';
import Request from '#utils/Request';
import _ts from '#ts';

/*
 * parent: setState, unSetProject
*/

export default class ProjectDeleteRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ deletePending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ deletePending: false });
    }

    handleSuccess = () => {
        const { projectId, usergroupId } = this.extraParent;
        this.parent.unSetProject({
            projectId,
            usergroupId,
        });
        notify.send({
            title: _ts('userGroup', 'userProjectDelete'),
            type: notify.type.SUCCESS,
            message: _ts('userGroup', 'userProjectDeleteSuccess'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.setState({ showDeleteProjectModal: false });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('userGroup', 'userProjectDelete'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userProjectDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userGroup', 'userProjectDelete'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userProjectDeleteFailure'),
            duration: notify.duration.SLOW,
        });
    }

    init = (projectId, usergroupId) => {
        this.extraParent = { projectId, usergroupId };
        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectDelete(),
        });
        return this;
    }
}
