import {
    createParamsForProjectCreate,
    urlForProjectCreate,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * - setState
 * - setUserProject
 * - setUserProfileProject
 * - setUsergroupProject
 * - onProjectAdd?
 * - onModalClose
 */
export default class ProjectCreateRequest extends Request {
    schemaName = 'projectCreateResponse';

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUserProject({ project: response });
        this.parent.setUsergroupProject({ project: response });
        this.parent.setUserProfileProject({
            userId: this.extraParent.userId,
            project: response,
        });
        if (this.parent.onProjectAdd) {
            this.parent.onProjectAdd(response.id);
        }
        notify.send({
            title: _ts('components.addProject', 'userProjectCreate'),
            type: notify.type.SUCCESS,
            message: _ts('components.addProject', 'userProjectCreateSuccess'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.onModalClose();
    }

    handleFailure = (faramErrors) => {
        this.parent.setState({ faramErrors });
    }

    handleFatal = () => {
        this.parent.setState({
            faramErrors: { $internal: _ts('components.addProject', 'projectCreateFatalError') },
        });
    }

    init = (userId, values) => {
        this.extraParent = { userId };
        this.createDefault({
            url: urlForProjectCreate,
            params: createParamsForProjectCreate(values),
        });
        return this;
    }
}
