import {
    createUrlForRegion,
    createParamsForRegionPatch,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * setState, setRegionDetails, setRegionDetailsErrors
*/
export default class RegionDetailPatchRequest extends Request {
    schemaName = 'regionPatchResponse'

    handlePreLoad = () => {
        this.parent.setState({ regionDetailPatchPending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ regionDetailPatchPending: false });
    }

    handleSuccess = (response) => {
        const {
            regionId,
            projectId,
        } = this.extraParent;
        const regionDetails = {
            id: response.id,
            public: response.public,
            versionId: response.versionId,
            faramValues: { ...response },
            faramErrors: {},
            pristine: false,
        };
        this.parent.setRegionDetails({
            regionDetails,
            regionId,
            projectId,
        });
        notify.send({
            type: notify.type.SUCCESS,
            title: _ts('project', 'regionSave'),
            message: _ts('project', 'regionSaveSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = (faramErrors) => {
        const { regionId } = this.extraParent;
        this.parent.setRegionDetailsErrors({
            faramErrors,
            regionId,
        });
    }

    handleFatal = () => {
        const { regionId } = this.extraParent;
        this.parent.setRegionDetailsErrors({
            faramErrors: { $internal: [_ts('countries', 'regionPatchErrorText')] },
            regionId,
        });
    }

    init = (projectId, regionId, data) => {
        this.extraParent = { regionId, projectId };
        this.createDefault({
            url: createUrlForRegion(regionId),
            params: createParamsForRegionPatch(data),
        });
        return this;
    }
}
