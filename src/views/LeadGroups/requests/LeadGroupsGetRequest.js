import { FgRestBuilder } from '#rsu/rest';
import {
    createParamsForGet,
    createUrlForLeadGroupsOfProject,
    transformAndCombineResponseErrors,
} from '#rest';
import { getFiltersForRequest } from '#entities/lead';
import _ts from '#ts';

import notify from '#notify';

export default class LeadGroupsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = projectId => (response) => {
        try {
            this.props.setLeadGroups({
                projectId,
                leadGroups: response.results,
                totalLeadGroupsCount: response.count,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const message = transformAndCombineResponseErrors(response.errors);
        notify.send({
            title: _ts('leadGroups', 'leadGroupTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = (response) => {
        console.warn('fatal:', response);
    }

    create = ({
        activeProject,
        activePage,
        activeSort,
        filters,
        MAX_LEADGROUPS_PER_REQUEST,
    }) => {
        const sanitizedFilters = getFiltersForRequest(filters);
        const leadGroupsRequestOffset = (activePage - 1) * MAX_LEADGROUPS_PER_REQUEST;
        const leadGroupsRequestLimit = MAX_LEADGROUPS_PER_REQUEST;

        const url = createUrlForLeadGroupsOfProject({
            project: activeProject,
            ordering: activeSort,
            ...sanitizedFilters,
            offset: leadGroupsRequestOffset,
            limit: leadGroupsRequestLimit,
        });

        const leadGroupsRequest = new FgRestBuilder()
            .url(url)
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success(activeProject))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return leadGroupsRequest;
    }
}
