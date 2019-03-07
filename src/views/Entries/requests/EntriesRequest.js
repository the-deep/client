import Request from '#utils/Request';
import {
    createUrlForFilteredEntries,
    createParamsForFilteredEntries,
} from '#rest';
import { unique } from '#rsu/common';

export default class EntriesRequest extends Request {
    schemaName = 'entriesGetResponse';

    handlePreLoad = () => {
        this.parent.setState({ pendingEntries: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingEntries: false });
    }

    handleSuccess = (response) => {
        const {
            results: responseEntries,
            count: totalEntriesCount,
        } = response;

        const uniqueLeadList = unique(
            responseEntries.map(entry => entry.lead),
            v => v,
            v => v.id,
        ).map(l => ({
            ...l,
            entries: responseEntries
                .filter(e => l.id === e.lead.id)
                .map(e => ({ ...e, lead: e.lead.id })),
        }));

        this.parent.setEntries({
            projectId: this.parent.getProjectId(),
            entries: uniqueLeadList,
            totalEntriesCount,
        });
    }

    getUrl = () => (
        createUrlForFilteredEntries({
            offset: this.parent.getOffset(),
            limit: this.parent.getLimit(),
        })
    )

    getParam = () => (
        createParamsForFilteredEntries({
            ...this.parent.getFilters(),
            project: this.parent.getProjectId(),
        })
    )

    init = () => {
        this.createDefault({
            url: this.getUrl,
            params: this.getParam,
        });
    }
}
