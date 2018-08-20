import {
    createUrlForProject,
    createParamsForProjectDelete,
} from '#rest';
import notify from '#notify';
import Request from '#utils/Request';
import _ts from '#ts';

/*
 * props: setState, unSetProject
*/

export default class ProjectDeleteRequest extends Request {
    handleSucces = () => {
        const { id, userId } = this.extraParent;
        this.parent.unSetProject({
            projectId: id,
            userId,
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

    init = (id, userId) => {
        this.extraParent = { id, userId };
        this.createDefault({
            url: createUrlForProject(id),
            params: createParamsForProjectDelete(),
        });
        return this;
    }
}
