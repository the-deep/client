import {
    createParamsForCeCreate,
    urlForCeCreate,
} from '#rest';
import Request from '#utils/Request';
import _ts from '#ts';

/*
 * Pulls all the Analysis Framework
 * Required:
 * - setState
 * - addNewCe
 * - onModalClose
 */
export default class ProjectCeCreateRequest extends Request {
    schemaName = 'categoryEditor'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.addNewCe({
            ceDetail: response,
        });
        this.parent.setActiveWordCategory(response.id);
        this.parent.onModalClose();
    }

    handleFailure = (faramErrors) => {
        this.parent.setState({ faramErrors });
    }

    handleFatal = () => {
        this.parent.setState({
            faramErrors: { $internal: [_ts('project', 'categoryEditorCreateFailure')] },
        });
    }

    init = (values) => {
        this.createDefault({
            url: urlForCeCreate,
            params: createParamsForCeCreate({ ...values, project: undefined }),
        });
        return this;
    }
}
