import {
    createUrlForProject,
    createParamsForProjectPatch,
} from '#rest';
import Request from '#utils/Request';

export default class UseWordCategoryRequest extends Request {
    schemaName = 'project'

    handlePreLoad = () => {
        this.parent.setState({ pendingWordCategoryUse: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingWordCategoryUse: false });
    }

    handleSuccess = () => {
        this.parent.setProjectWordCategory({
            projectId: this.projectId,
            ceId: this.wordCategoryId,
        });
    }

    init = (wordCategoryId, projectId) => {
        this.projectId = projectId;
        this.wordCategoryId = wordCategoryId;

        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectPatch({ analysisWordCategory: wordCategoryId }),
        });
        return this;
    }
}
