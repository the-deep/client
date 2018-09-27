import Request from '#utils/Request';

import {
    createParamsForGet,
    createUrlForAnalysisFramework,
} from '#rest';

// TODO: handle errors as well -_-
export default class FrameworkGet extends Request {
    schemaName = 'analysisFramework';

    handlePreLoad = () => {
        this.parent.setState({ pendingFramework: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingFramework: false });
    }

    handleSuccess = (response) => {
        this.parent.setState({ framework: response });
    }

    init = (frameworkId) => {
        this.createDefault({
            url: createUrlForAnalysisFramework(frameworkId),
            params: createParamsForGet(),
        });

        return this;
    }
}
