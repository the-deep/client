import { createSelector } from 'reselect';

import {
    listToMap,
    compareNumber,
} from '@togglecorp/fujs';
import {
    entryAccessor,
    entryGroupAccessor,
    calculateEntryState,
    calculateEntryGroupState,
} from '#entities/editEntries';

import {
    getSchemaForWidget,
    getComputeSchemaForWidget,
} from '#utils/widget';

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

export const editEntriesLabelsSelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => editEntry.labels || emptyArray,

    editEntry => [...(editEntry.labels || emptyArray)].sort(
        (a, b) => (
            compareNumber(a.order, b.order)
            || compareNumber(a.id, b.id)
        ),
    ),

);

export const editEntriesEntriesSelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => [...(editEntry.entries || emptyArray)].sort(
        (a, b) => (
            compareNumber(entryAccessor.order(a), entryAccessor.order(b))
            || compareNumber(entryAccessor.serverId(a), entryAccessor.serverId(b))
        ),
    ),
);

export const editEntriesEntryGroupsSelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => [...(editEntry.entryGroups || emptyArray)].sort(
        (a, b) => (
            compareNumber(entryGroupAccessor.order(a), entryGroupAccessor.order(b))
            || compareNumber(entryGroupAccessor.serverId(a), entryGroupAccessor.serverId(b))
        ),
    ),
);

export const editEntriesFilteredEntryGroupsSelector = createSelector(
    editEntriesEntryGroupsSelector,
    entryGroups => entryGroups.filter(
        entry => !entryAccessor.isMarkedAsDeleted(entry),
    ),
);

export const editEntriesEntryGroupRestsSelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => editEntry.entryGroupRests || emptyObject,
);

export const editEntriesEntryGroupStatusesSelector = createSelector(
    editEntriesEntryGroupsSelector,
    editEntriesEntryGroupRestsSelector,
    (entryGroups, rests) => listToMap(
        entryGroups,
        entryGroup => entryGroupAccessor.key(entryGroup),
        (entryGroup, key) => calculateEntryGroupState({
            entryGroup,
            restPending: !!rests[key],
        }),
    ),
);

export const editEntriesRestsSelector = createSelector(
    editEntriesForLeadSelector,
    editEntry => editEntry.entryRests || emptyObject,
);

export const editEntriesFilteredEntriesSelector = createSelector(
    editEntriesEntriesSelector,
    entries => entries.filter(
        entry => !entryAccessor.isMarkedAsDeleted(entry),
    ),
);

export const editEntriesStatusesSelector = createSelector(
    editEntriesEntriesSelector,
    editEntriesRestsSelector,
    (entries, rests) => listToMap(
        entries,
        entry => entryAccessor.key(entry),
        (entry, key) => calculateEntryState({ entry, restPending: !!rests[key] }),
    ),
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

export const editEntriesSchemaSelector = createSelector(
    editEntriesWidgetsSelector,
    (widgets) => {
        const schema = {
            fields: {
                // put fields here
            },
        };
        widgets.forEach((widget) => {
            schema.fields[widget.id] = {
                fields: {
                    id: [],
                    data: getSchemaForWidget(widget),
                },
            };
        });

        return schema;
    },
);

export const editEntriesComputeSchemaSelector = createSelector(
    editEntriesWidgetsSelector,
    (widgets) => {
        const schema = {
            fields: {
                // put fields here
            },
        };
        widgets.forEach((widget) => {
            const schemaForWidget = getComputeSchemaForWidget(widget, widgets);
            if (schemaForWidget) {
                schema.fields[widget.id] = {
                    fields: { data: { fields: {
                        value: schemaForWidget,
                    } } },
                };
            }
        });

        return schema;
    },
);
