import {
    createUrlForProject,
    createParamsForProjectDelete,
} from '#rest';
import notify from '#notify';
import _ts from '#ts';

/*
 * props: setState, unSetProject
*/

export default class ProjectDeleteRequest extends Request {
    handleSucces = (id, userId) => {
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

    init = () => {
        const { id } = this.parent;
        this.createDefault({
            url: createUrlForProject(id),
            params: createParamsForProjectDelete(),
        });
    }
}
