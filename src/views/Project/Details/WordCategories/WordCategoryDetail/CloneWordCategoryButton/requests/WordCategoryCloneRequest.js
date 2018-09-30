import {
    createUrlForCeClone,
    createParamsForCeClone,
} from '#rest';
import Request from '#utils/Request';

export default class WordCategoryCloneRequest extends Request {
    schemaName = 'categoryEditor'

    handlePreLoad = () => {
        this.parent.setState({ pendingWordCategoryClone: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingWordCategoryClone: false });
    }

    handleSuccess = (response) => {
        this.parent.addNewWordCategory({
            ceDetail: response,
        });

        this.parent.setActiveWordCategory(response.id);
        this.parent.onModalClose();
    }

    init = (wordCategoryId, projectId, faramValues) => {
        this.projectId = projectId;

        this.createDefault({
            url: createUrlForCeClone(wordCategoryId),

            // setting project undefined doesn't set the wordCategory to project
            params: createParamsForCeClone({
                ...faramValues,
                project: undefined,
            }),
        });

        return this;
    }
}
