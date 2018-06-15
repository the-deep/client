import { FgRestBuilder } from '#rs/utils/rest';
import notify from '#notify';
import {
    alterAndCombineResponseErrors,
    createUrlForProjectClusterData,
    createParamsForProjectClusterData,
} from '#rest';
import schema from '#schema';
import _ts from '#ts';

export default class ProjectClusterDataRequest {
    constructor(params) {
        const {
            setState,
            setProjectClusterData,
        } = params;
        this.setState = setState;
        this.setProjectClusterData = setProjectClusterData;
    }

    success = projectId => (response) => {
        try {
            schema.validate(response, 'clusterDataResponse');
            this.setProjectClusterData({ projectId, clusterData: response.data });
        } catch (err) {
            console.error(err);
        }
    }

    failure = (response) => {
        const message = alterAndCombineResponseErrors(response.errors);
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message: _ts('clusterViz', 'clusterDataRequestFatal'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (modelId, projectId) => {
        const clusterDataRequest = new FgRestBuilder()
            .url(createUrlForProjectClusterData(modelId))
            .params(createParamsForProjectClusterData)
            .maxPollAttempts(50)
            .pollTime(2000)
            .shouldPoll((response, status) => status !== 200)
            .postLoad(() => {
                this.setState({ clusterDataPending: false });
            })
            .success(this.success(projectId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();

        return clusterDataRequest;
    }
}
