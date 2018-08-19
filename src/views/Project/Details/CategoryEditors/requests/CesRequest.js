import {
    urlForCategoryEditors,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';

/*
 * Pulls all the Analysis Framework
 * Required:
 * - setState
 * - setCategoryEditors
 */
export default class ProjectCesRequest extends Request {
    schemaName = 'categoryEditorList'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setCategoryEditors({
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
