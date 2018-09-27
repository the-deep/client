import {
    createUrlForCeClone,
    createParamsForCeClone,
} from '#rest';
import Request from '#utils/Request';

export default class ProjectCeCloneRequest extends Request {
    schemaName = 'categoryEditor'

    handlePreLoad = () => {
        this.parent.setState({ pendingWordCategoryClone: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingWordCategoryClone: false });
    }

    handleSuccess = (response) => {
        this.parent.setState({ showCloneWordCategoryModal: false });
        this.parent.addNewWordCategory({
            ceDetail: response,
            projectId: this.projectId,
        });
    }

    init = (wordCategoryId, projectId, faramValues) => {
        this.projectId = projectId;

        this.createDefault({
            url: createUrlForCeClone(wordCategoryId),

            // setting project undefined doesn't set the wordCategory to project
            params: createParamsForCeClone({
                project: undefined,
                ...faramValues,
            }),
        });

        return this;
    }
}
