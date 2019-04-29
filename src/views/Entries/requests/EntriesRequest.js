import Request from '#utils/Request';
import {
    createUrlForFilteredEntries,
    createParamsForFilteredEntries,
} from '#rest';
import { processEntryFilters } from '#entities/entries';
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

    getParam = () => {
        const widgetFilters = this.parent.getFilters();
        const framework = this.parent.getFramework();
        const geoOptions = this.parent.getGeoOptions();

        const otherFilters = {
            project: this.parent.getProjectId(),
        };

        const processedFilters = processEntryFilters(
            widgetFilters,
            framework,
            geoOptions,
        );

        return createParamsForFilteredEntries([
            ...processedFilters,
            ...Object.entries(otherFilters),
        ]);
    }

    init = () => {
        this.createDefault({
            url: this.getUrl,
            params: this.getParam,
        });
    }
}
