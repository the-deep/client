import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForRssField,
    createParamsForGet,
} from '#rest';

export default class RssFieldsGet extends Request {
    schemaName = 'rssOptions';

    handlePreLoad = () => {
        this.parent.setState({ pendingRssFields: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingRssFields: false });
    }

    handleSuccess = (response) => {
        this.parent.setState({ rssOptions: response.results });
    }

    handleFailure = (response) => {
        const faramErrors = { params: response };
        this.parent.setConnectorError({
            faramErrors,
            connectorId: this.parent.connectorId,
        });
        this.parent.setState({ rssOptions: undefined });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('entries', 'entriesTabLabel'),
            type: notify.type.ERROR,
            message: _ts('connector', 'connectorGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    init = (url) => {
        this.createDefault({
            url: createUrlForRssField(url),
            params: createParamsForGet(),
        });
    }
}
