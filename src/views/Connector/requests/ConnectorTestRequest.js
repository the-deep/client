import { FgRestBuilder } from '#rs/utils/rest';

import {
    createParamsForConnectorTest,
    createUrlForConnectorTest,
} from '#rest';
import {
    randomString,
} from '#rs/utils/common';
import _ts from '#ts';
import schema from '#schema';
import notify from '#notify';

export default class ConnectorTestRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'connectorLeads');
            this.props.setState({ testLeads: response.results.filter(r => r.key) });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        notify.send({
            title: _ts('connector', 'connectorTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('connector', 'connectorTitle'),
            type: notify.type.ERROR,
            message: _ts('connector', 'connectorTestFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (source, paramsForTest) => {
        const connectorsRequest = new FgRestBuilder()
            .url(createUrlForConnectorTest(source))
            .params(createParamsForConnectorTest(paramsForTest))
            .preLoad(() => {
                this.props.setState({ connectorTestLoading: true });
                this.props.onConnectorTestLoading(true);
            })
            .postLoad(() => {
                this.props.setState({ connectorTestLoading: false });
                this.props.onConnectorTestLoading(false);
            })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
