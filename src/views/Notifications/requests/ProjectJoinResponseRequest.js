import { FgRestBuilder } from '#rs/utils/rest';

import {
    createParamsForProjectJoinResponse,
    createUrlForProjectJoinResponse,
    transformAndCombineResponseErrors,
} from '#rest';

import _ts from '#ts';
import notify from '#notify';

export default class ProjectJoinResponseRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            this.props.setProjectJoinStatus({ newNotificationDetails: response });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const message = transformAndCombineResponseErrors(response.errors);
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

    create = (projectId, requestId, response) => {
        const projectJoinResponseRequest = new FgRestBuilder()
            .url(createUrlForProjectJoinResponse(projectId, requestId, response))
            .params(createParamsForProjectJoinResponse())
            .preLoad(() => { this.props.setState({ approvalLoading: true }); })
            .postLoad(() => { this.props.setState({ approvalLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return projectJoinResponseRequest;
    }
}
