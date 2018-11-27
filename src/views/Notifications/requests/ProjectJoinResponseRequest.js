import { FgRestBuilder } from '#rsu/rest';

import {
    createParamsForProjectJoinResponse,
    createUrlForProjectJoinResponse,
    alterAndCombineResponseError,
} from '#rest';

import _ts from '#ts';
import notify from '#notify';

export default class ProjectJoinResponseRequest {
    constructor(props) {
        this.props = props;
    }

    success = (newNotificationDetails) => {
        this.props.setProjectJoinStatus({ newNotificationDetails });
    }

    failure = (response) => {
        const message = alterAndCombineResponseError(response.errors);
        notify.send({
            title: _ts('notifications', 'projectJoinResponse'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('notifications', 'projectJoinResponse'),
            type: notify.type.ERROR,
            message: _ts('notifications', 'projectJoinResponseFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (projectId, requestId, response, role) => {
        const body = response ? { role } : {};

        const projectJoinResponseRequest = new FgRestBuilder()
            .url(createUrlForProjectJoinResponse(projectId, requestId, response))
            .params(createParamsForProjectJoinResponse(body))
            .preLoad(() => { this.props.setState({ approvalLoading: true }); })
            .postLoad(() => { this.props.setState({ approvalLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return projectJoinResponseRequest;
    }
}
