import Request from '#utils/Request';
import notify from '#notify';
import { checkVersion } from '#rs/utils/common';

import _ts from '#ts';

import {
    createParamsForGet,
    createUrlForAnalysisFramework,
} from '#rest';

export default class FrameworkGet extends Request {
    schemaName = 'analysisFramework';

    handlePreLoad = () => {
        this.parent.setState({ pendingFramework: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingFramework: false });
    }

    handleSuccess = (response) => {
        const {
            setAnalysisFramework,
            getAnalysisFramework,
        } = this.parent;

        const analysisFramework = getAnalysisFramework();

        const {
            shouldSetValue,
            isValueOverriden,
        } = checkVersion(analysisFramework.versionId, response.versionId);

        if (shouldSetValue) {
            setAnalysisFramework({ analysisFramework: response });
        }
        if (isValueOverriden) {
            notify.send({
                type: notify.type.WARNING,
                title: _ts('framework', 'afUpdate'),
                message: _ts('framework', 'afUpdateOverridden'),
                duration: notify.duration.SLOW,
            });
        }
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

    init = (frameworkId) => {
        this.createDefault({
            url: createUrlForAnalysisFramework(frameworkId),
            params: createParamsForGet(),
        });
    }
}
