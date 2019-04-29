import Request from '#utils/Request';
import {
    createUrlForFilteredEntries,
    createParamsForFilteredEntries,
} from '#rest';
import { processEntryFilters } from '#entities/entries';
import { unique } from '#rsu/common';

/*
const tree = [
    {
        key: 1,
        parent: undefined,
    },
    {
        key: 2,
        parent: 1,
    },
    {
        key: 3,
        parent: 2,
    },
    {
        key: 4,
        parent: 2,
    },
    {
        key: 5,
        parent: 3,
    },
    {
        key: 6,
        parent: 4,
    },
    {
        key: 7,
        parent: 4,
    },
    {
        key: 8,
        parent: 5,
    },
    {
        key: 9,
        parent: 6,
    },
    {
        key: 10,
        parent: 6,
    },
];

const treeMap = listToMap(
    tree,
    v => v.key,
    v => v,
);

const tests = [
    {
        input: [8],
        ouput: [1, 2, 3, 5, 8],
    },
    {
        input: [6, 3],
        ouput: [1, 2, 3, 4, 6],
    },
    {
        input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ouput: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
        input: [],
        ouput: [],
    },
    {
        input: [6, 7],
        ouput: [1, 2, 4, 6, 7],
    },
];
tests.forEach((test) => {
    const op = aggregate(new Set(test.input), treeMap);
    console.warn([...op].sort(), test.ouput.sort());
});
*/


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
