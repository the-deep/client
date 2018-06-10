import { FgRestBuilder } from '#rs/utils/rest';

import {
    createParamsForProjectJoinResponse,
    createUrlForProjectJoinResponse,
} from '#rest';

import schema from '#schema';

export default class ProjectJoinResponseRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            console.warn(response);
            this.props.setProjectJoinStatus({ newNotificationDetails: response });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        console.warn(response);
    }

    fatal = () => {
        console.warn('fata');
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
