import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForProjectOptions,
    createParamsForGet,
} from '#rest';

export default class ProjectOptionsGet extends Request {
    schemaName = 'projectOptionsGetResponse';

    handlePreLoad = () => {
        this.parent.setState({ pendingProjectOptions: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingProjectOptions: false });
    }

    handleSuccess = (response) => {
        this.parent.setProjectOptions({
            projectId: this.projectId,
            options: response,
        });
    }

    handleFailure = (response) => {
        const message = response.$internal.join(' ');
        notify.send({
            type: notify.type.ERROR,
            title: _ts('project', 'projectOptions'),
            message,
            duration: notify.duration.SLOW,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('project', 'projectOptions'),
            type: notify.type.ERROR,
            message: _ts('project', 'projectOptionsGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    init = (projectId) => {
        this.projectId = projectId;
        this.createDefault({
            url: createUrlForProjectOptions(projectId),
            params: createParamsForGet(),
        });
    }
}
