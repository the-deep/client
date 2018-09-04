import {
    createUrlForProject,
    createParamsForProjectPatch,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * Pulls all the Analysis Framework
 * Parent Required:
 *  - setState
 *  - setProject
 *  - onModalClose
 *  - onRegionsAdd?
 */
export default class AddExistingRegionProjectPatchRequest extends Request {
    schemaName = 'project'

    handlePostLoad = () => {
        this.parent.setState({ pristine: false });
    }

    handleSuccess = (response) => {
        this.parent.setProject({ project: response });
        notify.send({
            title: _ts('project', 'countryCreate'),
            type: notify.type.SUCCESS,
            message: _ts('project', 'countryCreateSuccess'),
            duration: notify.duration.MEDIUM,
        });
        if (this.parent.onRegionsAdd) {
            this.parent.onRegionsAdd(this.addedRegions);
        }
        this.parent.onModalClose();
    }

    handleFailure = (faramErrors) => {
        notify.send({
            title: _ts('project', 'countryCreate'),
            type: notify.type.ERROR,
            message: _ts('project', 'countryCreateFailure'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.setState({ faramErrors });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('project', 'countryCreate'),
            type: notify.type.ERROR,
            message: _ts('project', 'countryCreateFatal'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.setState({
            faramErrors: { $internal: [_ts('project', 'projectSaveFailure')] },
        });
    }

    init = (newProjectDetails, projectId, addedRegions) => {
        this.addedRegions = addedRegions;
        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectPatch(newProjectDetails),
        });
        return this;
    }
}
