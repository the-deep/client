import { FgRestBuilder } from '#rs/utils/rest';

import {
    createParamsForConnectorTest,
    alterResponseErrorToFaramError,
    createUrlForConnectorTest,
} from '#rest';
import _ts from '#ts';
import schema from '#schema';
import notify from '#notify';

export default class ConnectorTestRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            console.warn(response);
            schema.validate(response, 'connectorLeads');
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.props.setState({
            faramErrors,
            pending: false,
        });
    }

    fatal = () => {
        this.props.setState({
            faramErrors: { $internal: [_ts('connector', 'connectorCreateFailure')] },
        });
    }

    create = (source, paramsForTest) => {
        const connectorsRequest = new FgRestBuilder()
            .url(createUrlForConnectorTest(source))
            .params(createParamsForConnectorTest(paramsForTest))
            .preLoad(() => { this.props.setState({ connectorTestLoading: true }); })
            .postLoad(() => { this.props.setState({ connectorTestLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
