import {
    createUrlForRegionClone,
    createParamsForRegionClone,
} from '#rest';
import Request from '#utils/Request';

/*
 * setState, onRegionClone?, addNewRegion, removeProjectRegion
 */
export default class RegionCloneRequest extends Request {
    schemaName = 'region'

    handlePreLoad = () => {
        this.parent.setState({ regionClonePending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ regionClonePending: false });
    }

    handleSuccess = (response) => {
        const { regionId, projectId } = this.extraParent;

        this.parent.addNewRegion({
            regionDetail: response,
            projectId,
        });
        this.parent.removeProjectRegion({
            projectId,
            regionId,
        });
        if (this.parent.onRegionClone) {
            this.parent.onRegionClone(response.id);
        }
    }

    handleFailure = (response) => {
        // FIXME: use strings
        console.warn('FAILURE:', response);
    }

    handleFatal = () => {
        // FIXME: use strings
        console.warn('FATAL:');
    }

    init = (regionId, projectId) => {
        this.extraParent = { regionId, projectId };
        this.createDefault({
            url: createUrlForRegionClone(regionId),
            params: createParamsForRegionClone({ project: projectId }),
        });
        return this;
    }
}
