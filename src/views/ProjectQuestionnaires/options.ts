import { listToMap } from '@togglecorp/fujs';


interface BasicEntity {
    key: string;
    value: string;
}

export const defaultKeySelector = (d: BasicEntity) => d.key;
export const defaultLabelSelector = (d: BasicEntity) => d.value;

export const crisisTypeOptionList = [
    { key: 'flood', value: 'Flood' },
    { key: 'conflict', value: 'Conflict' },
];

export const crisisTypeOptions = listToMap(
    crisisTypeOptionList,
    d => d.key,
    d => d.value,
);

export const dataCollectionTechniqueOptionList = [
    { key: 'direct', value: 'Direct' },
];

export const dataCollectionTechniqueOptions = listToMap(
    dataCollectionTechniqueOptionList,
    d => d.key,
    d => d.value,
);

export const enumerationSkillOptionList = [
    { key: 'basic', value: 'Basic' },
    { key: 'medium', value: 'Medium' },
];

export const enumerationSkillOptions = listToMap(
    enumerationSkillOptionList,
    d => d.key,
    d => d.value,
);
