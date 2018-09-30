import {
    createParamsForProjectPatch,
    createUrlForProject,
} from '#rest';
import Request from '#utils/Request';

/*
 * Pulls all the Analysis Framework
 * Required:
 * - setState
 * - setProjectCe
 */
export default class ProjectCeProjectPatchRequest extends Request {
    schemaName = 'project'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = () => {
        const { ceId, projectId } = this.extraParent;
        this.parent.setProjectCe({
            projectId,
            ceId,
        });
    }

    // TODO: handle Fatal and Failure
    // handleFailure = () => {}
    // handleFatal = () => {}

    init = (ceId, projectId) => {
        this.extraParent = { ceId, projectId };
        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectPatch({ categoryEditor: ceId }),
        });
        return this;
    }
}
