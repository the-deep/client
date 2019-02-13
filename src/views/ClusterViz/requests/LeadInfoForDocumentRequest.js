import { FgRestBuilder } from '#rsu/rest';
import notify from '#notify';
import {
    createUrlForLeadsOfProject,
    createParamsForGet,
} from '#rest';
import {
    mapToMap,
    listToMap,
} from '@togglecorp/fujs';
import schema from '#schema';
import _ts from '#ts';

export default class LeadInfoForDocumentRequest {
    constructor(params) {
        const {
            documents,
            keywords,
            setState,
            setProjectClusterData,
        } = params;
        this.documents = documents;
        this.keywords = keywords;
        this.setState = setState;
        this.setProjectClusterData = setProjectClusterData;
    }

    success = projectId => (response) => {
        try {
            schema.validate(response, 'leadsDetailForClusterDocs');
            const leads = response.results;

            const leadsMap = listToMap(
                leads,
                lead => lead.classifiedDocId,
                lead => lead,
            );

            const newDocuments = mapToMap(
                this.documents,
                undefined,
                docIds => docIds.map(docId => leadsMap[docId]).filter(val => val !== undefined),
            );

            this.setProjectClusterData({
                projectId,
                documents: newDocuments,
                keywords: this.keywords,
            });
        } catch (err) {
            console.error(err);
        }
    }

    failure = (response) => {
        this.setState({ clusterDataFailure: true });
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message: response.message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        this.setState({ clusterDataFailure: true });
        notify.send({
            title: _ts('clusterViz', 'clusterVizTitle'),
            type: notify.type.ERROR,
            message: _ts('clusterViz', 'leadsInfoRequestFatal'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (projectId, documents) => {
        const urlMapDocIdToLeadsDetail = createUrlForLeadsOfProject({
            project: projectId,
            classified_doc_id: documents,
            fields: ['title', 'classified_doc_id', 'created_at', 'id'],
        });

        const request = new FgRestBuilder()
            .url(urlMapDocIdToLeadsDetail)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ clusterDataPending: true });
            })
            .postLoad(() => {
                this.setState({ clusterDataPending: false });
            })
            .success(this.success(projectId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();

        return request;
    }
}
