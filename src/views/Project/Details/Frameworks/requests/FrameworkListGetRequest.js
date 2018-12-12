import {
    urlForAnalysisFrameworks,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

// TODO: Use project.framework namespace for strings
export default class FrameworkListGetRequest extends Request {
    schemaName = 'analysisFrameworkList'

    handlePreLoad = () => {
        this.parent.setState({ pendingFrameworkList: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingFrameworkList: false });
    }

    handleSuccess = (response) => {
        this.parent.setFrameworkList({
            analysisFrameworks: response.results,
        });
    }

    handleFailure = (response) => {
        const message = response.$internal.join(' ');
        notify.send({
            title: _ts('project', 'afGetTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('project', 'afGetTitle'),
            type: notify.type.ERROR,
            message: _ts('project', 'afGetFatal'),
            duration: notify.duration.SLOW,
        });
    }

    init = () => {
        this.createDefault({
            url: urlForAnalysisFrameworks,
            params: createParamsForGet,
        });

        return this;
    }
}
