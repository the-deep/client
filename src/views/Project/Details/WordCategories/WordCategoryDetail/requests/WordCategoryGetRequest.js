import {
    createUrlForWordCategoryGet,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';

// TODO: handle errors as well -_-
export default class WordCategoryGetRequest extends Request {
    schemaName = 'categoryEditor'

    handlePreLoad = () => {
        this.parent.setState({ pendingCategoryEditor: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingCategoryEditor: false });
    }

    handleSuccess = (response) => {
        this.parent.setState({ wordCategory: response });
    }

    init = (ceId, projectId) => {
        this.projectId = projectId;

        this.createDefault({
            // FIXME: this url doesn't exist
            url: createUrlForWordCategoryGet(),
            params: createParamsForGet(),
        });

        return this;
    }
}
