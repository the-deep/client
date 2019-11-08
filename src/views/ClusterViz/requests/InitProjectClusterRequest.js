import { FgRestBuilder } from '#rsu/rest';
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

    componentWillUnmount() {
        this.stopRequestForClusterData();
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
        this.setState({
            createClusterFailure: true,
            errorMessage: response.message,
        });
    }

    fatal = () => {
        this.setState({
            createClusterFailure: true,
            errorMessage: _ts('clusterViz', 'clusterInitRequestFatal'),
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
