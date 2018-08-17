import {
    createUrlForAfClone,
    createParamsForAfClone,
} from '#rest';
import Request from '#utils/Request';

/*
 * Pulls all the Analysis Framework
 * Required:
 *  - setState
 *  - addNewAf
 */
export default class ProjectAfCloneRequest extends Request {
    schemaName = 'analysisFramework'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.addNewAf({
            afDetail: response,
            projectId: this.projectId,
        });
    }

    init = (afId, projectId) => {
        this.projectId = projectId;

        this.createDefault({
            url: createUrlForAfClone(afId),
            params: createParamsForAfClone({ project: projectId }),
        });
        return this;
    }
}
