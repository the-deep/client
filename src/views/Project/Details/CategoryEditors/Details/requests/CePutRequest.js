import {
    createParamsForCeEdit,
    createUrlForCategoryEditor,
} from '#rest';
import Request from '#utils/Request';

/*
 * Pulls all the Analysis Framework
 * Required:
 * - setState
 * - setCeDetail
 */
export default class ProjectCePutRequest extends Request {
    schemaName = 'categoryEditor'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        const { ceId } = this.extraParent;
        this.parent.setCeDetail({
            ceId,
            ceDetail: response,
        });
    }

    // TODO: handle Fatal and Failure
    // handleFailure = () => {}
    // handleFatal = () => {}

    init = (ceId, values) => {
        this.extraParent = { ceId };
        this.createDefault({
            url: createUrlForCategoryEditor(ceId),
            params: createParamsForCeEdit(values),
        });
        return this;
    }
}
