import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForConnector,
    createParamsForConnectorDelete,
} from '#rest';

export default class ConnectorDelete extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingDelete: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingDelete: false });
    }

    handleSuccess = () => {
        this.parent.deleteConnector({ connectorId: this.connectorId });
        this.parent.onConnectorDelete();
    }

    handleFailure = (response) => {
        console.warn(response);
    }

    handleFatal = () => {
        notify.send({
            title: _ts('connector', 'connectorTitle'),
            type: notify.type.ERROR,
            message: _ts('connector', 'connectorDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    init = (connectorId) => {
        this.connectorId = connectorId;
        this.createDefault({
            url: createUrlForConnector(connectorId),
            params: createParamsForConnectorDelete(),
        });
    }
}
