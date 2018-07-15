import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForGeoOptions,
    createParamsForGet,
} from '#rest';

export default class GeoOptionsRequest extends Request {
    schemaName = 'geoOptions';

    handlePreLoad = () => {
        this.parent.setState({ pendingGeoOptions: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingGeoOptions: false });
    }

    handleSuccess = (response) => {
        this.parent.setGeoOptions({
            projectId: this.parent.getProjectId(),
            locations: response,
        });
    }

    handleFailure = (response) => {
        const message = response.$internal.join(' ');
        notify.send({
            title: _ts('entries', 'entriesTabLabel'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('entries', 'entriesTabLabel'),
            type: notify.type.ERROR,
            message: _ts('entries', 'geoOptionsFatalMessage'),
            duration: notify.duration.MEDIUM,
        });
    }

    init = () => {
        this.createDefault({
            url: createUrlForGeoOptions(this.parent.getProjectId()),
            params: createParamsForGet(),
        });
    }
}
