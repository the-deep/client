import {
    createUrlForAfClone,
    createParamsForAfClone,
} from '#rest';
import Request from '#utils/Request';

/*
 * Request to clone framework
 * Required:
 *  - setState
 *  - addNewFramework
 */
export default class FrameworkCloneRequest extends Request {
    schemaName = 'analysisFramework'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.addNewFramework({
            afDetail: response,
            projectId: this.projectId,
        });
    }

    init = (frameworkId, projectId) => {
        this.projectId = projectId;

        this.createDefault({
            url: createUrlForAfClone(frameworkId),
            params: createParamsForAfClone({ project: projectId }),
        });

        return this;
    }
}
