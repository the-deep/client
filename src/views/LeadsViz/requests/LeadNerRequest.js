import { FgRestBuilder } from '#rsu/rest';
import notify from '#notify';
import {
    createUrlForLeadNerDocsId,
    createParamsForLeadNer,
} from '#rest';
import _ts from '#ts';

export default class LeadNerRequest {
    constructor(params) {
        const {
            setLeadVisualization,
            setState,
        } = params;
        this.setLeadVisualization = setLeadVisualization;
        this.setState = setState;
    }

    create = ({ docIds, activeProject, isFilter }) => {
        const request = new FgRestBuilder()
            .url(createUrlForLeadNerDocsId(activeProject, isFilter))
            .params(createParamsForLeadNer({
                doc_ids: docIds,
            }))
            .preLoad(() => {
                this.setState({ geoPointsDataPending: true });
            })
            .postLoad(() => {
                this.setState({ geoPointsDataPending: false });
            })
            .success((response) => {
                // FIXME: write schema
                this.setLeadVisualization({
                    geoPoints: response.locations,
                    projectId: activeProject.id,
                });
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: _ts('leadsViz', 'ner'),
                    type: notify.type.ERROR,
                    message: _ts('leadsViz', 'nerGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leadsViz', 'ner'),
                    type: notify.type.ERROR,
                    message: _ts('leadsViz', 'nerGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }
}
