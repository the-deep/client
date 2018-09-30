import {
    urlForCategoryEditors,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';

export default class WordCategoryListGetRequest extends Request {
    schemaName = 'categoryEditorList'

    handlePreLoad = () => {
        this.parent.setState({ pendingWordCategoryList: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingWordCategoryList: false });
    }

    handleSuccess = (response) => {
        const { setWordCategoryList } = this.parent;

        setWordCategoryList({
            categoryEditors: response.results,
        });
    }

    // TODO: Add handleFailure, handleFatal
    // handleFailure = () => {}
    // handleFatal = () => {}

    init = () => {
        this.createDefault({
            url: urlForCategoryEditors,
            params: createParamsForGet,
        });

        return this;
    }
}
