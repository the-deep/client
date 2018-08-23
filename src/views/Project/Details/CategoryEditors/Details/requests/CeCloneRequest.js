import {
    createUrlForCeClone,
    createParamsForCeClone,
} from '#rest';
import Request from '#utils/Request';

/*
 * Pulls all the Analysis Framework
 * Required:
 * - setState
 * - addNewCe
 */
export default class ProjectCeCloneRequest extends Request {
    schemaName = 'categoryEditor'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        const { projectId } = this.extraParent;
        this.parent.addNewCe({
            ceDetail: response,
            projectId,
        });
    }

    // TODO: handle Fatal and Failure
    // handleFailure = () => {}
    // handleFatal = () => {}

    init = (ceId, projectId) => {
        this.extraParent = { projectId };
        this.createDefault({
            url: createUrlForCeClone(ceId),
            params: createParamsForCeClone({ project: projectId }),
        });
        return this;
    }
}
