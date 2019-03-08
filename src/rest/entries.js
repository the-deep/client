import {
    wsEndpoint,
    POST,
    PUT,
    DELETE,
    p,
    commonHeaderForPost,
} from '#config/rest';

export const urlForEntry = `${wsEndpoint}/entries/`;
export const urlForEntryCreate = `${wsEndpoint}/entries/`;
export const createUrlForFilteredEntries = params => (
    `${wsEndpoint}/entries/filter/?${p(params)}`
);

export const createUrlForEntryEdit = entryId => (
    `${wsEndpoint}/entries/${entryId}/`
);
export const createUrlForEntries = projectId => (
    `${wsEndpoint}/entries/?${p({ project: projectId })}`
);

// TODO: move this somewhere else
const ONE_DAY = 24 * 60 * 60 * 1000;
const toDays = (date) => {
    if (!date) {
        return undefined;
    }

    return Math.round(new Date(date).getTime() / ONE_DAY);
};

const totMinutes = (time) => {
    if (!time) {
        return undefined;
    }

    const splits = time.split(':');
    if (splits.length < 2) {
        return undefined;
    }

    return (parseInt(splits[0], 10) * 60) + parseInt(splits[1], 10);
};
export const processEntryFilters = (filters) => {
    const result = [];
    filters.forEach((filter) => {
        if (typeof filter[1] === 'object' && filter[1].startDate) {
            result.push([
                `${filter[0]}__gt`,
                toDays(filter[1].startDate),
            ]);
            result.push([
                `${filter[0]}__lt`,
                toDays(filter[1].endDate),
            ]);
        } else if (typeof filter[1] === 'object' && filter[1].startTime) {
            result.push([
                `${filter[0]}__gt`,
                totMinutes(filter[1].startTime),
            ]);
            result.push([
                `${filter[0]}__lt`,
                totMinutes(filter[1].endTime),
            ]);
        } else {
            result.push(filter);
        }
    });
    return result;
};

export const createParamsForFilteredEntries = filters => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        filters: processEntryFilters(Object.entries(filters)),
    }),
});

export const createParamsForEntryCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForEntryEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createUrlForEntriesOfLead = leadId => (
    `${wsEndpoint}/entries/processed/?${p({ lead: leadId })}`
);

export const createUrlForDeleteEntry = entryId => (
    `${wsEndpoint}/entries/${entryId}/`
);
export const createParamsForDeleteEntry = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createUrlEditEntryGet = leadId => (
    `${wsEndpoint}/edit-entries-data/${leadId}/`
);
