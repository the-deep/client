import {
    urlForAnalysisFrameworks,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * Pulls all the Analysis Framework
 * Required:
 *  - setState
 *  - setAnalysisFrameworks
 */
export default class ProjectAfsGetRequest extends Request {
    schemaName = 'analysisFrameworkList'

    handlePreLoad = () => {
        this.parent.setState({ afLoading: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ afLoading: false });
    }

    handleSuccess = (response) => {
        this.parent.setAnalysisFrameworks({
            analysisFrameworks: response.results,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('project', 'afGetTitle'),
            type: notify.type.ERROR,
            message: _ts('project', 'afGetFailure'),
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
    }
}
