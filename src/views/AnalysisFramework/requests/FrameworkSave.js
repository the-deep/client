import Request from '#utils/Request';
import notify from '#notify';

import _ts from '#ts';

import {
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '#rest';

export default class FrameworkSave extends Request {
    schemaName = 'analysisFramework';

    handlePreLoad = () => {
        this.parent.setState({ pendingFramework: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingFramework: false });
    }

    handleSuccess = (response) => {
        const { setAnalysisFramework } = this.parent;

        setAnalysisFramework({ analysisFramework: response });

        notify.send({
            title: _ts('framework', 'afTitle'),
            type: notify.type.SUCCESS,
            message: _ts('framework', 'afSaveSuccess'),
            duration: notify.duration.SLOW,
        });
    }

    handleFailure = (response) => {
        const message = response.$internal.join(' ');
        notify.send({
            type: notify.type.ERROR,
            title: _ts('framework', 'afUpdate'),
            message,
            duration: notify.duration.SLOW,
        });
    }

    handleFatal = () => {
        notify.send({
            type: notify.type.ERROR,
            title: _ts('framework', 'afUpdate'),
            message: _ts('framework', 'afFatalError'),
            duration: notify.duration.SLOW,
        });
    }

    init = (frameworkId, framework) => {
        this.createDefault({
            url: createUrlForAnalysisFramework(frameworkId),
            params: createParamsForAnalysisFrameworkEdit(framework),
        });
    }
}
