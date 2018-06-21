import { createSelector } from 'reselect';

import { entryAccessor } from '#entities/editEntriesBetter';

import {
    analysisFrameworksSelector,
    projectsSelector,
    leadIdFromRoute,
} from '../domainData';

const emptyObject = {};
const emptyArray = [];

const editEntriesSelector = ({ siloDomainData }) => (
    siloDomainData.editEntries || emptyObject
);

// get edit entries for current lead (get lead from url)
export const editEntriesForLeadSelector = createSelector(
    leadIdFromRoute,
    editEntriesSelector,
    (leadId, editEntry) => editEntry[leadId] || emptyObject,
);

export const editEntriesLeadSelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => editEntry.lead || emptyObject,
);

export const editEntriesEntriesSelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => editEntry.entries || emptyArray,
);

export const editEntriesSelectedEntryKeySelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => editEntry.selectedEntryKey,
);

export const editEntriesSelectedEntrySelector = createSelector(
    editEntriesEntriesSelector,
    editEntriesSelectedEntryKeySelector,
    (entries, selectedEntryKey) => {
        if (selectedEntryKey === undefined) {
            return undefined;
        }
        return entries.find(
            entry => entryAccessor.key(entry) === selectedEntryKey,
        );
    },
);

export const editEntriesProjectSelector = createSelector(
    editEntriesLeadSelector,
    projectsSelector,
    (lead, projects) => (lead.project && projects[lead.project]) || emptyObject,
);

export const editEntriesAnalysisFrameworkSelector = createSelector(
    editEntriesProjectSelector,
    analysisFrameworksSelector,
    (project, analysisFrameworks) => (
        (project.analysisFramework && analysisFrameworks[project.analysisFramework]) || emptyObject
    ),
);

export const editEntriesWidgetsSelector = createSelector(
    editEntriesAnalysisFrameworkSelector,
    analysisFramework => analysisFramework.widgets || emptyArray,
);
