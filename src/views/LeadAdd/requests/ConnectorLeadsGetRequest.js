import { FgRestBuilder } from '#rs/utils/rest';
import {
    createParamsForConnectorLeads,
    createUrlForConnectorleads,
    alterAndCombineResponseErrors,
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
            const connectorLeads = response.results.map((l) => {
                const isSelected = selectedLeads.findIndex(s => s.key === l.key) !== -1;

                return {
                    ...l,
                    isSelected,
                };
            });
            this.props.setConnectorLeads({
                connectorLeads,
                totalConnectorLeadsCount: response.count,
                connectorId,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const message = alterAndCombineResponseErrors(response.errors);
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
