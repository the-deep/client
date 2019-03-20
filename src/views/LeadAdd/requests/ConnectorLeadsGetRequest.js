import { FgRestBuilder } from '#rsu/rest';
import { mapToList } from '@togglecorp/fujs';
import {
    createParamsForConnectorLeads,
    createUrlForConnectorleads,
    alterAndCombineResponseError,
} from '#rest';

import _ts from '#ts';
import schema from '#schema';
import notify from '#notify';

export default class ConnectorLeadsRequest {
    constructor(props) {
        this.props = props;
    }

    success = connectorId => (response) => {
        const { selectedLeads } = this.props;

        try {
            schema.validate(response, 'connectorLeads');
            const leads = response.results.map((l) => {
                const isSelected = selectedLeads.findIndex(s => s.key === l.key) !== -1;

                return {
                    ...l,
                    isSelected,
                };
            });
            const leadsMap = {};
            leads.forEach((l) => { leadsMap[l.key] = l; });
            const uniqueLeads = mapToList(
                leadsMap,
                lead => lead,
            );

            this.props.setConnectorLeads({
                leads: uniqueLeads,
                totalCount: response.count,
                connectorId,
                countPerPage: response.countPerPage,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const message = alterAndCombineResponseError(response.errors);
        notify.send({
            title: _ts('addLeads', 'connectorSourcesTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('addLeads', 'connectorSourcesTitle'),
            type: notify.type.ERROR,
            message: _ts('addLeads', 'connectorSourcesGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (
        connectorId,
        projectId,
        activePage,
        maxLeadsPerRequest,
        filtersData,
    ) => {
        const body = {
            project: projectId,
            offset: (activePage - 1) * maxLeadsPerRequest,
            limit: maxLeadsPerRequest,
            ...filtersData,
        };

        const connectorLeadsRequest = new FgRestBuilder()
            .url(createUrlForConnectorleads(connectorId))
            .params(createParamsForConnectorLeads(body))
            .preLoad(() => { this.props.setState({ connectorLeadsLoading: true }); })
            .postLoad(() => { this.props.setState({ connectorLeadsLoading: false }); })
            .success(this.success(connectorId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorLeadsRequest;
    }
}
