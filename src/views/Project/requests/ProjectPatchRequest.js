import {
    createParamsForProjectPatch,
    createUrlForProject,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * - setState, removeProjectRegion
 */
export default class ProjectPatchRequest extends Request {
    schemaName = 'project'

    handlePreLoad = () => {
        this.parent.setState({ projectPatchPending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ projectPatchPending: false });
    }

    handleSuccess = () => {
        const { projectId, removedRegionId } = this.extraParent;
        this.parent.removeProjectRegion({
            projectId,
            regionId: removedRegionId,
        });
        notify.send({
            title: _ts('project', 'regionRemove'),
            type: notify.type.SUCCESS,
            message: _ts('project', 'regionRemoveSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('project', 'regionRemove'),
            type: notify.type.ERROR,
            message: _ts('project', 'regionRemoveFailure'),
            duration: notify.duration.SLOW,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('project', 'regionRemove'),
            type: notify.type.ERROR,
            message: _ts('project', 'regionRemoveFatal'),
            duration: notify.duration.SLOW,
        });
    }

    init = (projectId, removedRegionId, regions) => {
        this.extraParent = { projectId, removedRegionId };
        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForProjectPatch({ regions }),
        });
        return this;
    }
}
