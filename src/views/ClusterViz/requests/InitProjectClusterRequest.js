import { FgRestBuilder } from '#rsu/rest';
import notify from '#notify';
import schema from '#schema';

import {
    createUrlForInitClusterRequest,
    createParamsForInitClusterRequest,
} from '#rest';
import _ts from '#ts';

export default class InitProjectClusterRequest {
    constructor(params) {
        const {
            stopRequestForClusterData,
            startRequestForClusterData,
            setState,
        } = params;
        this.stopRequestForClusterData = stopRequestForClusterData;
        this.startRequestForClusterData = startRequestForClusterData;
        this.setState = setState;
    }

    success = projectId => (response) => {
        try {
            schema.validate(response, 'initClusterRequest');
            const { cluster_model_id: modelId } = response;
            this.stopRequestForClusterData();
            this.startRequestForClusterData(modelId, projectId);
        } catch (err) {
            console.warn(err);
        }
    }

    failure = (response) => {
        this.setState({ createClusterFailure: true });
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message: response.message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        this.setState({ createClusterFailure: true });
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message: _ts('clusterViz', 'clusterInitRequestFatal'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (projectId, noOfCluster) => {
        const initClusterRequest = new FgRestBuilder()
            .url(createUrlForInitClusterRequest)
            .params(() => createParamsForInitClusterRequest({
                group_id: projectId,
                num_clusters: noOfCluster,
            }))
            .preLoad(() => {
                this.setState({ createClusterPending: true });
            })
            .postLoad(() => {
                this.setState({ createClusterPending: false });
            })
            .success(this.success(projectId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();

        return initClusterRequest;
    }
}
