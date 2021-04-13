import { createSelector } from 'reselect';
import { mapToList } from '@togglecorp/fujs';

import update from '#rsu/immutable-update';
import { unique } from '#rsu/common';

import {
    createFooLanguageSelector,
    createFooStringsSelector,
    createFooLinksSelector,
} from '../lang';

const emptyObject = {};
const emptyArray = [];

// Identify valid changes and invalid changes to strings
const patchStrings = (strings, stateStrings) => {
    const unset = [];
    const set = {};
    const changes = {};

    strings.forEach((stringAction, index) => {
        const { id, oldValue, value, action } = stringAction;
        switch (action) {
            case 'delete':
                if (stateStrings[id] === undefined) {
                    changes[index] = { message: { $set: 'String does not exist' } };
                } else if (stateStrings[id] !== oldValue) {
                    changes[index] = { message: { $set: 'String has changed' } };
                } else {
                    unset.push(id);
                }
                break;
            case 'edit':
                if (stateStrings[id] === undefined) {
                    changes[index] = { message: { $set: 'String does not exist' } };
                } else if (stateStrings[id] !== oldValue) {
                    changes[index] = { message: { $set: 'String has changed' } };
                } else {
                    set[id] = { $set: value };
                }
                break;
            case 'add':
                if (stateStrings[id] !== undefined) {
                    changes[index] = { message: { $set: 'String already exists' } };
                } else {
                    set[id] = { $set: value };
                }
                break;
            default:
                console.warn(`Patch String: Unrecognized action '${action}'`);
                break;
        }
    });

    const actions = [];
    if (unset.length > 0) {
        actions.push({ $unset: unset });
    }
    if (Object.keys(set).length > 0) {
        actions.push(set);
    }
    return { actions, changes };
};

// Identify valid changes and invalid changes to linkCollection
const patchLinkCollection = (links, stateLinks) => {
    const unset = [];
    const set = {};
    const changes = {};

    links.forEach((linkAction, index) => {
        const { key, string, oldString, action } = linkAction;
        switch (action) {
            case 'delete':
                // TODO: currently link only looks at change in link value
                // but not on value of strings the link are pointing
                if (stateLinks === undefined || stateLinks[key] === undefined) {
                    changes[index] = { message: { $set: 'Link does not exist' } };
                } else if (stateLinks[key] !== oldString) {
                    changes[index] = { message: { $set: 'Link has changed' } };
                } else {
                    unset.push(key);
                }
                break;
            case 'edit':
                if (stateLinks === undefined || stateLinks[key] === undefined) {
                    changes[index] = { message: { $set: 'Link does not exist' } };
                } else if (stateLinks[key] !== oldString) {
                    changes[index] = { message: { $set: 'Link has changed' } };
                } else {
                    set[key] = { $set: string };
                }
                break;
            case 'add':
                if (stateLinks !== undefined && stateLinks[key] !== undefined) {
                    changes[index] = { message: { $set: 'Link already exists' } };
                } else {
                    set[key] = { $set: string };
                }
                break;
            default:
                console.warn(`Patch Link: Unrecognized action '${action}'`);
                break;
        }
    });

    const actions = [];
    if (unset.length > 0) {
        actions.push({ $unset: unset });
    }
    if (Object.keys(set).length > 0) {
        actions.push(set);
    }
    return { actions, changes };
};

// Extract the last part of name, where part is separated by '.'
// Concatenate the last part with corresponding number of spaces
const indentName = (name) => {
    const countOfDotOccurence = (name.match(/\./g) || []).length;
    if (countOfDotOccurence > 0) {
        const spaces = '  '.repeat(countOfDotOccurence);
        const lastPart = name.substring(name.lastIndexOf('.') + 1, name.length);
        return `${spaces}↳ ${lastPart}`;
    }
    return name;
};

// Accessor functions
const getStringRefsInCode = (usageMap, linkCollectionName, stringName) => (
    (usageMap[linkCollectionName] && usageMap[linkCollectionName][stringName])
        ? usageMap[linkCollectionName][stringName].length
        : 0
);
const getLinkCollectionFromLinks = (links = {}, linkName) => (
    links[linkName] || {}
);
const getLinkCollectionFromUsageMap = (usageMaps = {}, linkName) => (
    usageMaps[linkName] || {}
);
const getStringNameFromLinkCollection = (linkCollection = {}, linkName) => (
    linkCollection[linkName]
);
const getStringFromStrings = (strings = {}, stringName) => (
    strings[stringName]
);

// COMMON SELECTORS

const stringManagementViewSelector = ({ siloDomainData }) => siloDomainData.stringManagementView;

const languageChangesSelector = createSelector(
    stringManagementViewSelector,
    stringManagementView => stringManagementView.languageChanges || emptyObject,
);

export const selectedLanguageNameSelector = createSelector(
    stringManagementViewSelector,
    stringManagementView => stringManagementView.selectedLanguage || '$devLang',
);

export const selectedLinkCollectionNameSelector = createSelector(
    stringManagementViewSelector,
    stringManagementView => stringManagementView.selectedLinkCollectionName || '$all',
);

// SELECTED LANGUAGE CHANGES

const selectedLanguageChangesSelector = createSelector(
    languageChangesSelector,
    selectedLanguageNameSelector,
    (languageChanges, selectedLanguageName) => (
        languageChanges[selectedLanguageName] || emptyObject
    ),
);

const selectedLanguageStringsChangesUnfilteredSelector = createSelector(
    selectedLanguageChangesSelector,
    languageChanges => languageChanges.strings || emptyArray,
);
const selectedLanguageLinksChangesUnfilteredSelector = createSelector(
    selectedLanguageChangesSelector,
    languageChanges => languageChanges.links || emptyObject,
);

export const hasSelectedLanguageChangesSelector = createSelector(
    selectedLanguageStringsChangesUnfilteredSelector,
    selectedLanguageLinksChangesUnfilteredSelector,
    (strings, links) => (
        strings.length > 0
            || Object.keys(links)
                .some(key => links[key] && links[key].length > 0)
    ),
);

// SELECTED LANGUAGE

const selectedLanguageSelector = createFooLanguageSelector(selectedLanguageNameSelector);
const selectedStringsUnfilteredSelector = createFooStringsSelector(selectedLanguageSelector);
const selectedLinksUnfilteredSelector = createFooLinksSelector(selectedLanguageSelector);

// Filtered

export const selectedLanguageStringsChangesSelector = createSelector(
    selectedStringsUnfilteredSelector,
    selectedLanguageStringsChangesUnfilteredSelector,
    (strings, stringsChanges) => {
        const { changes } = patchStrings(stringsChanges, strings);
        if (Object.keys(changes).length < 0) {
            return stringsChanges;
        }
        return update(stringsChanges, changes);
    },
);

export const selectedLanguageLinksChangesSelector = createSelector(
    selectedLinksUnfilteredSelector,
    selectedLanguageLinksChangesUnfilteredSelector,
    (links, linksChanges) => {
        const linksSetting = {};
        Object.keys(linksChanges).forEach((linkCollectionName) => {
            const { changes } = patchLinkCollection(
                linksChanges[linkCollectionName],
                links[linkCollectionName],
            );
            if (Object.keys(changes).length > 0) {
                linksSetting[linkCollectionName] = changes;
            }
        });

        if (Object.keys(linksSetting).length < 0) {
            return linksChanges;
        }
        return update(linksChanges, linksSetting);
    },
);

export const hasInvalidChangesSelector = createSelector(
    selectedLanguageStringsChangesSelector,
    selectedLanguageLinksChangesSelector,
    (strings, links) => (
        strings.find(string => !!string.message)
            || Object.keys(links)
                .some(key => !!links[key] && links[key].find(link => !!link.message))
    ),
);

export const selectedStringsFilteredSelector = createSelector(
    selectedStringsUnfilteredSelector,
    selectedLanguageStringsChangesUnfilteredSelector,
    (strings, stringsChanges) => {
        const { actions } = patchStrings(stringsChanges, strings);
        if (actions.length < 0) {
            return strings;
        }
        return update(strings, { $bulk: actions });
    },
);
export const selectedLinksFilteredSelector = createSelector(
    selectedLinksUnfilteredSelector,
    selectedLanguageLinksChangesUnfilteredSelector,
    (links, linksChanges) => {
        const linksSetting = {};
        Object.keys(linksChanges).forEach((linkCollectionName) => {
            const { actions } = patchLinkCollection(
                linksChanges[linkCollectionName],
                links[linkCollectionName],
            );
            if (actions.length > 0) {
                linksSetting[linkCollectionName] = { $auto: { $bulk: actions } };
            }
        });

        if (Object.keys(linksSetting).length < 0) {
            return links;
        }

        return update(links, linksSetting);
    },
);

const selectedLinkCollectionSelector = createSelector(
    selectedLinksFilteredSelector,
    selectedLinkCollectionNameSelector,
    (links, linkCollectionName) => links[linkCollectionName] || emptyArray,
);

// STATS

const usageMapSelector = () => {
    try {
        /* eslint-disable global-require */
        /* eslint-disable import/no-unresolved */
        /* eslint-disable @typescript-eslint/no-var-requires */
        return require('../../../generated/usage').default;
        /* eslint-enable @typescript-eslint/no-var-requires */
        /* eslint-enable global-require */
        /* eslint-enable import/no-unresolved */
    } catch (ex) {
        console.warn(ex);
        return {};
    }
};

const duplicatedStringsSelector = createSelector(
    selectedStringsFilteredSelector,
    (strings) => {
        // Get duplicated strings
        const duplicatedStrings = {};

        const memory = {};
        Object.keys(strings).forEach((stringName) => {
            const value = getStringFromStrings(strings, stringName).toLowerCase();
            // first encountered string id with this value
            const firstEncounteredStringName = memory[value];
            if (firstEncounteredStringName) {
                // set id of first encountered string
                duplicatedStrings[stringName] = firstEncounteredStringName;
            } else {
                // memorize to identify duplicates
                memory[value] = +stringName;
            }
        });

        return duplicatedStrings;
    },
);

const referenceCountOfStringsSelector = createSelector(
    selectedStringsFilteredSelector,
    selectedLinksFilteredSelector,
    usageMapSelector,
    (strings, links, usageMaps) => {
        // Initialize reference count for string
        const stringReferenceCount = {};
        Object.keys(strings).forEach((stringName) => {
            stringReferenceCount[stringName] = 0;
        });
        // Calculate reference count for string
        Object.keys(links).forEach((linkCollectionName) => {
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            Object.keys(linkCollection).forEach((linkName) => {
                const refsInCode = getStringRefsInCode(usageMaps, linkCollectionName, linkName);
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (stringName !== undefined && string !== undefined) {
                    stringReferenceCount[stringName] += refsInCode;
                }
            });
        });
        return stringReferenceCount;
    },
);

// List all the problems with links and strings
const problemCollectionsSelector = createSelector(
    selectedStringsFilteredSelector,
    selectedLinksFilteredSelector,
    usageMapSelector,
    selectedLanguageStringsChangesSelector,
    selectedLanguageLinksChangesSelector,
    (strings, links, usageMaps, stringsChanges, linksChanges) => {
        // Initialize new problems

        const keys = unique([
            ...Object.keys(usageMaps),
            ...Object.keys(links),
            ...Object.keys(linksChanges),
        ]);
        const newProblems = keys.reduce(
            (acc, key) => {
                acc[key] = {
                    addLinks: {
                        title: 'Added link',
                        type: 'info',
                        instances: [],
                    },
                    deleteLinks: {
                        title: 'Deleted link',
                        type: 'info',
                        instances: [],
                    },
                    editLinks: {
                        title: 'Edited link',
                        type: 'info',
                        instances: [],
                    },

                    badLink: {
                        title: 'Bad link',
                        type: 'error',
                        instances: [],
                    },
                    undefinedLink: {
                        title: 'Undefined link',
                        type: 'error',
                        instances: [],
                    },
                    unusedLinks: {
                        title: 'Unused link',
                        type: 'warning',
                        instances: [],
                    },
                };
                return acc;
            },
            {
                $all: {
                    addStrings: {
                        title: 'Added string',
                        type: 'info',
                        instances: [],
                    },
                    deleteStrings: {
                        title: 'Deleted string',
                        type: 'info',
                        instances: [],
                    },
                    editStrings: {
                        title: 'Edited string',
                        type: 'info',
                        instances: [],
                    },

                    unusedStrings: {
                        title: 'Unused string',
                        type: 'warning',
                        instances: [],
                    },
                },
            },
        );

        // Identify strings changes
        newProblems.$all.addStrings.instances = stringsChanges
            .filter(v => v.action === 'add');
        newProblems.$all.deleteStrings.instances = stringsChanges
            .filter(v => v.action === 'delete');
        newProblems.$all.editStrings.instances = stringsChanges
            .filter(v => v.action === 'edit');

        // Identify links changes
        Object.keys(linksChanges).forEach((linkCollectionName) => {
            const alias = newProblems[linkCollectionName];
            alias.addLinks.instances = linksChanges[linkCollectionName]
                .filter(v => v.action === 'add');
            alias.deleteLinks.instances = linksChanges[linkCollectionName]
                .filter(v => v.action === 'delete');
            alias.editLinks.instances = linksChanges[linkCollectionName]
                .filter(v => v.action === 'edit');
        });

        // Identify strings not linked by any linkCollection
        const stringNameReferenced = Object.keys(strings).reduce(
            (acc, val) => {
                acc[val] = false;
                return acc;
            },
            {},
        );
        Object.keys(links).forEach((linkCollectionName) => {
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            Object.keys(linkCollection).forEach((linkName) => {
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                if (stringName !== undefined) {
                    stringNameReferenced[stringName] = true;
                }
            });
        });

        Object.keys(stringNameReferenced).forEach((key) => {
            if (!stringNameReferenced[key]) {
                newProblems.$all.unusedStrings.instances.push({ key, value: strings[key] });
            }
        });

        // Identify unused links
        // Identify links not referencing a valid string
        Object.keys(links).forEach((linkCollectionName) => {
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            Object.keys(linkCollection).forEach((linkName) => {
                // identify unused links
                const refsInCode = getStringRefsInCode(usageMaps, linkCollectionName, linkName);
                if (refsInCode <= 0) {
                    newProblems[linkCollectionName].unusedLinks.instances.push(linkName);
                }

                // identify bad links
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (stringName === undefined || string === undefined) {
                    newProblems[linkCollectionName].badLink.instances.push(linkName);
                }
            });
        });

        // Identify bad-references of string in code
        Object.keys(usageMaps).forEach((linkCollectionName) => {
            const linkCollectionFromUsage = getLinkCollectionFromUsageMap(
                usageMaps,
                linkCollectionName,
            );
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);

            // Only iterate over keys that are not present in linkCollection
            const usageLinkCollectionNames = Object.keys(linkCollectionFromUsage)
                .filter(key => !linkCollection[key]);

            usageLinkCollectionNames.forEach((linkName) => {
                // Identify bad references in link (not available in links or strings)
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (stringName === undefined || string === undefined) {
                    newProblems[linkCollectionName].undefinedLink.instances.push(linkName);
                }
            });
        });
        return newProblems;
    },
);
export const problemCollectionSelector = createSelector(
    problemCollectionsSelector,
    selectedLinkCollectionNameSelector,
    (problemCollections, linkCollectionName) => (
        problemCollections[linkCollectionName] || emptyObject
    ),
);

// Get count of all the problems with links and strings
export const problemCollectionsStatsSelector = createSelector(
    problemCollectionsSelector,
    problems => Object.keys(problems).reduce(
        (acc, key) => {
            const problemValues = Object.values(problems[key]);

            let errorCount = 0;
            let warningCount = 0;
            let infoCount = 0;
            problemValues.forEach((problem) => {
                if (problem.type === 'error') {
                    errorCount += problem.instances.length;
                } else if (problem.type === 'warning') {
                    warningCount += problem.instances.length;
                } else if (problem.type === 'info') {
                    infoCount += problem.instances.length;
                }
            });

            acc[key] = { errorCount, warningCount, infoCount };
            return acc;
        },
        {},
    ),
);
export const problemCollectionStatsSelector = createSelector(
    problemCollectionsStatsSelector,
    selectedLinkCollectionNameSelector,
    (problemCollectionsStats, linkCollectionName) => (
        problemCollectionsStats[linkCollectionName] || emptyObject
    ),
);

// Get strings for tabular view
export const allStringsSelector = createSelector(
    selectedStringsFilteredSelector,
    duplicatedStringsSelector,
    referenceCountOfStringsSelector,
    (strings, duplicatedStrings, stringsReferenceCount) => mapToList(
        strings,
        (stringValue, stringName) => ({
            id: +stringName,
            string: stringValue,
            refs: stringsReferenceCount[stringName],
            duplicates: duplicatedStrings[stringName],
        }),
    ),
);

// Get linkCollection for tabular view
export const linkCollectionSelector = createSelector(
    selectedStringsFilteredSelector,
    selectedLinkCollectionSelector,
    usageMapSelector,
    selectedLinkCollectionNameSelector,
    (strings, linkCollection, usedMaps, linkCollectionName) => mapToList(
        linkCollection,
        (stringName, linkName) => ({
            id: linkName,
            string: getStringFromStrings(strings, stringName),
            stringId: +stringName,
            refs: getStringRefsInCode(usedMaps, linkCollectionName, linkName),
        }),
    ),
);

// Iterate over usageMap, and get all the keys
// Create hierarchical structure for keys
// Add 'all' to show strings
// Sort the keys alphabetically
export const linkKeysSelector = createSelector(
    usageMapSelector,
    selectedLinksFilteredSelector,
    (usedMaps, links) => {
        // keys must be of both usage and language
        const keys = unique([...Object.keys(usedMaps), ...Object.keys(links)]).sort();

        // create hierarchical elements
        const newKeys = {};
        keys.forEach((key) => {
            let val = key;
            let lastIndex;
            newKeys[val] = indentName(val);
            do {
                lastIndex = val.lastIndexOf('.');
                if (lastIndex !== -1) {
                    val = val.substring(0, lastIndex);
                    if (!newKeys[val]) {
                        newKeys[val] = indentName(val);
                    }
                }
            } while (lastIndex !== -1);
        });

        const sortedKeys = Object.keys(newKeys).sort().reduce(
            (acc, key) => {
                acc[key] = newKeys[key];
                return acc;
            },
            {
                $all: 'all',
            },
        );

        return sortedKeys;
    },
);
