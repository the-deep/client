import { createSelector } from 'reselect';
import {
    createFooLanguageSelector,
    createFooStringsSelector,
    createFooLinksSelector,
} from '../lang';
import { unique, mapToList } from '../../../vendor/react-store/utils/common';
import update from '../../../vendor/react-store/utils/immutable-update';

const patchStrings = (strings, stateStrings) => {
    const actions = [];

    const unset = [];
    const set = {};

    // DELETE
    strings
        .filter(string => string.action === 'delete')
        .forEach((stringAction) => {
            const { id, oldValue } = stringAction;

            if (stateStrings[id] === undefined) {
                console.warn('FAIL: String Delete: Non-existing string');
            } else if (stateStrings[id] !== oldValue) {
                console.warn('FAIL: String Delete: Changed string');
            } else {
                unset.push(id);
            }
        });

    // EDIT
    strings
        .filter(string => string.action === 'edit')
        .forEach((stringAction) => {
            const { id, oldValue, value } = stringAction;

            if (stateStrings[id] === undefined) {
                console.warn('FAIL: String Edit: Non-existing string');
            } else if (stateStrings[id] !== oldValue) {
                console.warn('FAIL: String Edit: Changed string');
            } else {
                set[id] = { $set: value };
            }
        });

    // ADD
    strings
        .filter(string => string.action === 'add')
        .forEach((stringAction) => {
            const { id, value } = stringAction;

            if (stateStrings[id] !== undefined) {
                console.warn('FAIL: String Add: Existing string');
            } else {
                set[id] = { $set: value };
            }
        });

    if (unset.length > 0) {
        actions.push({ $unset: unset });
    }
    if (Object.keys(set).length > 0) {
        actions.push(set);
    }
    return actions;
};

const patchLinkCollection = (links, stateLinks) => {
    const actions = [];

    const unset = [];
    const set = {};

    // DELETE
    links
        .filter(link => link.action === 'delete')
        .forEach((linkAction) => {
            const { key, oldString } = linkAction;

            // TODO: currently link only looks at change in link value
            // but not on value of strings the link are pointing
            if (stateLinks === undefined || stateLinks[key] === undefined) {
                console.warn('FAIL: Link Delete: Non-existing link');
            } else if (stateLinks[key] !== oldString) {
                console.warn('FAIL: Link Delete: Changed link');
            } else {
                unset.push(key);
            }
        });

    // EDIT
    links
        .filter(link => link.action === 'edit')
        .forEach((linkAction) => {
            const { key, oldString, string } = linkAction;

            if (stateLinks === undefined || stateLinks[key] === undefined) {
                console.warn('FAIL: Link Edit: Non-existing link');
            } else if (stateLinks[key] !== oldString) {
                console.warn('FAIL: Link Edit: Changed link');
            } else {
                set[key] = { $set: string };
            }
        });

    // ADD
    links
        .filter(link => link.action === 'add')
        .forEach((linkAction) => {
            const { key, string } = linkAction;

            if (stateLinks !== undefined && stateLinks[key] !== undefined) {
                console.warn('FAIL: Link Add: Existing link');
            } else {
                set[key] = { $set: string };
            }
        });

    if (unset.length > 0) {
        actions.push({ $unset: unset });
    }
    if (Object.keys(set).length > 0) {
        actions.push(set);
    }
    return actions;
};

// Extract the last part of name, where part is separated by '.'
// Concatenate the last part with corresponding number of spaces
const indentName = (name) => {
    const countOfDotOccurence = (name.match(/\./g) || []).length;
    if (countOfDotOccurence > 0) {
        const spaces = ' '.repeat(countOfDotOccurence);
        const lastPart = name.substring(name.lastIndexOf('.') + 1, name.length);
        return `${spaces}» ${lastPart}`;
    }
    return name;
};

const emptyObject = {};
const emptyArray = [];

const stringManagementViewSelector = ({ siloDomainData }) => siloDomainData.stringManagementView;

export const selectedLanguageNameSelector = createSelector(
    stringManagementViewSelector,
    stringManagementView => stringManagementView.selectedLanguage || '$devLang',
);
export const selectedLinkCollectionNameSelector = createSelector(
    stringManagementViewSelector,
    stringManagementView => stringManagementView.selectedLinkCollectionName || '$all',
);

const languageChangesSelector = createSelector(
    stringManagementViewSelector,
    stringManagementView => stringManagementView.languageChanges || emptyObject,
);

const selectedLanguageChangesSelector = createSelector(
    languageChangesSelector,
    selectedLanguageNameSelector,
    (languageChanges, selectedLanguageName) => (
        languageChanges[selectedLanguageName] || emptyObject
    ),
);

const selectedLanguageStringsChangesSelector = createSelector(
    selectedLanguageChangesSelector,
    languageChanges => languageChanges.strings,
);
const selectedLanguageLinksChangesSelector = createSelector(
    selectedLanguageChangesSelector,
    languageChanges => languageChanges.links,
);

const selectedLanguageSelector = createFooLanguageSelector(selectedLanguageNameSelector);

const selectedStringsUnfilteredSelector = createFooStringsSelector(selectedLanguageSelector);
const selectedStringsSelector = createSelector(
    selectedStringsUnfilteredSelector,
    selectedLanguageStringsChangesSelector,
    (strings, stringsChanges) => {
        if (stringsChanges === undefined) {
            return strings;
        }
        const actions = patchStrings(stringsChanges, strings);
        if (actions.length < 0) {
            return strings;
        }
        return update(strings, { $bulk: actions });
    },
);

const selectedLinksUnfilteredSelector = createFooLinksSelector(selectedLanguageSelector);
const selectedLinksSelector = createSelector(
    selectedLinksUnfilteredSelector,
    selectedLanguageLinksChangesSelector,
    (links, linksChanges) => {
        if (linksChanges === undefined) {
            return links;
        }

        const linksSetting = {};
        Object.keys(linksChanges).forEach((linkCollectionName) => {
            const actions = patchLinkCollection(
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
    selectedLinksSelector,
    selectedLinkCollectionNameSelector,
    (links, linkCollectionName) => links[linkCollectionName] || emptyArray,
);

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

const usageMapSelector = () => {
    try {
        /* eslint-disable global-require */
        /* eslint-disable import/no-unresolved */
        return require('../../../generated/usage').default;
        /* eslint-enable global-require */
        /* eslint-enable import/no-unresolved */
    } catch (ex) {
        console.warn(ex);
        return {};
    }
};

const duplicatedStringsSelector = createSelector(
    selectedStringsSelector,
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
                memory[value] = stringName;
            }
        });

        return duplicatedStrings;
    },
);

const referenceCountOfStringsSelector = createSelector(
    selectedStringsSelector,
    selectedLinksSelector,
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
    selectedStringsSelector,
    selectedLinksSelector,
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
            .filter(v => v.action === 'add')
            .map(v => `${v.id}: ${v.value}`);
        newProblems.$all.deleteStrings.instances = stringsChanges
            .filter(v => v.action === 'delete')
            .map(v => `${v.id}: ${v.oldValue}`);
        newProblems.$all.editStrings.instances = stringsChanges
            .filter(v => v.action === 'edit')
            .map(v => `${v.id}: ${v.oldValue} → ${v.value}`);

        // Identify links changes
        Object.keys(linksChanges).forEach((linkCollectionName) => {
            const alias = newProblems[linkCollectionName];
            alias.addLinks.instances = linksChanges[linkCollectionName]
                .filter(v => v.action === 'add')
                .map(v => `${v.key}: ${v.string}`);
            alias.deleteLinks.instances = linksChanges[linkCollectionName]
                .filter(v => v.action === 'delete')
                .map(v => `${v.key}: ${v.oldString}`);
            alias.editLinks.instances = linksChanges[linkCollectionName]
                .filter(v => v.action === 'edit')
                .map(v => `${v.key}: ${v.oldString} → ${v.string}`);
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
                newProblems.$all.unusedStrings.instances.push(`${key}: ${strings[key]}`);
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
            Object.keys(linkCollectionFromUsage).forEach((linkName) => {
                // Identify bad references in link (not available in links or strings)
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (!stringName || !string) {
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
    selectedStringsSelector,
    duplicatedStringsSelector,
    referenceCountOfStringsSelector,
    (strings, duplicatedStrings, stringsReferenceCount) => mapToList(
        strings,
        (stringValue, stringName) => ({
            id: stringName,
            string: stringValue,
            refs: stringsReferenceCount[stringName],
            duplicates: duplicatedStrings[stringName],
        }),
    ),
);

// Get linkCollection for tabular view
export const linkCollectionSelector = createSelector(
    selectedStringsSelector,
    selectedLinkCollectionSelector,
    usageMapSelector,
    selectedLinkCollectionNameSelector,
    (strings, linkCollection, usedMaps, linkCollectionName) => mapToList(
        linkCollection,
        (stringName, linkName) => ({
            id: linkName,
            string: getStringFromStrings(strings, stringName),
            stringId: stringName,
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
    selectedLinksSelector,
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
