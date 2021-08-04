import { listToMap } from '@togglecorp/fujs';

import { KeyValueElement } from '#types';

export const defaultKeySelector = (d: KeyValueElement) => d.key;
export const defaultLabelSelector = (d: KeyValueElement) => d.value;

export const crisisTypeOptionList = [
    { key: 'flood', value: 'Flood' },
    { key: 'conflict', value: 'Conflict' },
];

export const crisisTypeOptions = listToMap(
    crisisTypeOptionList,
    defaultKeySelector,
    defaultLabelSelector,
);

export const dataCollectionTechniqueOptionList = [
    { key: 'direct', value: 'Direct' },
];

export const dataCollectionTechniqueOptions = listToMap(
    dataCollectionTechniqueOptionList,
    defaultKeySelector,
    defaultLabelSelector,
);

export const enumerationSkillOptionList = [
    { key: 'basic', value: 'Basic' },
    { key: 'medium', value: 'Medium' },
];

export const enumerationSkillOptions = listToMap(
    enumerationSkillOptionList,
    defaultKeySelector,
    defaultLabelSelector,
);

export const questionImportanceOptionList = [
    { key: '1', value: '1' },
    { key: '2', value: '2' },
    { key: '3', value: '3' },
    { key: '4', value: '4' },
    { key: '5', value: '5' },
];

export const questionImportanceOptions = listToMap(
    questionImportanceOptionList,
    defaultKeySelector,
    defaultLabelSelector,
);

export const questionTypeOptionList = [
    { key: '1', value: 'Text' },
    { key: '2', value: 'Not text' },
];

export const frameworkAttributeTypeOptionList = [
    { key: 'sector', value: 'Sector' },
    { key: 'dimension', value: 'Dimension' },
];

