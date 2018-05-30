import { FgRestBuilder } from '#rs/utils/rest';
import {
    createParamsForProjectPatch,
    createUrlForProject,
} from '#rest';
import _ts from '#ts';

import schema from '#schema';
import notify from '#notify';

export default class ProjectPatchRequest {
    constructor(props) {
        this.props = props;
    }

    success = (projectId, removedRegionId) => (response) => {
        try {
            schema.validate(response, 'project');
            this.props.removeProjectRegion({
                projectId,
                regionId: removedRegionId,
            });
            notify.send({
                title: _ts('project', 'regionRemove'),
                type: notify.type.SUCCESS,
                message: _ts('project', 'regionRemoveSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: _ts('project', 'regionRemove'),
            type: notify.type.ERROR,
            message: _ts('project', 'regionRemoveFailure'),
            duration: notify.duration.SLOW,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('project', 'regionRemove'),
            type: notify.type.ERROR,
            message: _ts('project', 'regionRemoveFatal'),
            duration: notify.duration.SLOW,
        });
    }

    create = (projectId, removedRegionId, regions) => {
        const regionDetailPatchRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForProjectPatch({ regions }))
            .preLoad(() => { this.props.setState({ projectPatchPending: true }); })
            .postLoad(() => { this.props.setState({ projectPatchPending: false }); })
            .success(this.success(projectId, removedRegionId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return regionDetailPatchRequest;
    }
}
