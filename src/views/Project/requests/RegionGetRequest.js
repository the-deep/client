import {
    createUrlForRegionWithField,
    createParamsForGet,
} from '#rest';

import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * setState, setRegionDetails
*/

export default class RegionGetRequest extends Request {
    schemaName = 'region'

    handlePreLoad = () => {
        this.parent.setState({ dataLoading: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ dataLoading: false });
    }

    handleSuccess = (response) => {
        const {
            regionDetail,
            setRegionDetails,
        } = this.parent;
        const {
            regionId,
            discard,
        } = this.extraParents;

        // FIXME: use utils.checkVersion method, don't compare version yourself
        if (response.versionId === regionDetail.versionId && !discard) {
            return;
        }
        const regionDetails = {
            faramValues: response,
            faramErrors: {},
            hasErrors: false,
            pristine: false,
            id: response.id,
            public: response.public,
            versionId: response.versionId,
        };
        setRegionDetails({
            regionDetails,
            regionId,
        });
        if (regionDetail.pristine && !discard) {
            notify.send({
                type: notify.type.WARNING,
                title: _ts('project', 'regionUpdate'),
                message: _ts('project', 'regionUpdateOverridden'),
                duration: notify.duration.SLOW,
            });
        }
    }

    handleFailure = (response) => {
        console.warn('FAILURE:', response);
    }

    handleFatal = () => {
        console.warn('FATAL:');
    }

    init = (regionId, discard) => {
        this.extraParents = { regionId, discard };

        this.createDefault({
            url: createUrlForRegionWithField(regionId),
            params: createParamsForGet,
        });
        return this;
    }
}
