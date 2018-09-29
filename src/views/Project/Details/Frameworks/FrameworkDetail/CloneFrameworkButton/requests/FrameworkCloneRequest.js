import {
    createUrlForAfClone,
    createParamsForAfClone,
} from '#rest';
import Request from '#utils/Request';

export default class FrameworkCloneRequest extends Request {
    schemaName = 'analysisFramework'

    handlePreLoad = () => {
        this.parent.setState({ pendingFrameworkClone: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingFrameworkClone: false });
    }

    handleSuccess = (response) => {
        this.parent.setState({ showCloneFrameworkModal: false });
        this.parent.addNewFramework({
            afDetail: response,
            projectId: this.projectId,
        });

        this.parent.setActiveFramework(response.id);
    }

    init = (frameworkId, projectId, faramValues) => {
        this.projectId = projectId;

        this.createDefault({
            url: createUrlForAfClone(frameworkId),

            // setting project undefined doesn't set the framework to project
            params: createParamsForAfClone({
                project: undefined,
                ...faramValues,
            }),
        });

        return this;
    }
}
