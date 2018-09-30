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
        this.parent.addNewFramework({
            afDetail: response,
        });

        this.parent.setActiveFramework(response.id);
        this.parent.closeModal();
    }

    init = (frameworkId, projectId, faramValues) => {
        this.projectId = projectId;

        this.createDefault({
            url: createUrlForAfClone(frameworkId),

            // setting project undefined doesn't set the framework to project
            params: createParamsForAfClone({
                ...faramValues,
                project: undefined,
            }),
        });

        return this;
    }
}
