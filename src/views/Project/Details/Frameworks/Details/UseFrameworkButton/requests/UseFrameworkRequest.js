import {
    createUrlForProject,
    createParamsForProjectPatch,
} from '#rest';
import Request from '#utils/Request';

/*
 * Pulls all the Analysis Framework
 * Required:
 *  - setState
 *  - setProjectFramework
 */
export default class UseFrameworkRequest extends Request {
    schemaName = 'project'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = () => {
        this.parent.setProjectFramework({
            projectId: this.projectId,
            afId: this.frameworkId,
        });
    }

    init = (frameworkId, projectId) => {
        this.projectId = projectId;
        this.frameworkId = frameworkId;

        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectPatch({ analysisFramework: frameworkId }),
        });
        return this;
    }
}
