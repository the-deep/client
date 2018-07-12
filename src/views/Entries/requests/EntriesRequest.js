import Request from '#utils/Request';
import {
    createUrlForFilteredEntries,
    createParamsForFilteredEntries,
} from '#rest';

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
            results: {
                entries: responseEntries,
                leads: responseLeads,
            },
            count: totalEntriesCount,
        } = response;

        const entries = responseLeads.map(lead => ({
            ...lead,
            entries: responseEntries.filter(e => e.lead === lead.id),
        }));

        this.parent.setEntries({
            projectId: this.parent.getProjectId(),
            entries,
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
        createParamsForFilteredEntries(this.parent.getFilters())
    )

    init = () => {
        this.createDefault({
            url: this.getUrl,
            params: this.getParam,
        });
    }
}
