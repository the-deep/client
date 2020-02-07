import {
    Matrix2dFlatCellElement,
    FrameworkElement,
} from './framework';

interface DbEntity {
    id: number;
    createdAt: string;
    modifiedAt: string;
    createdBy: number;
    modifiedBy?: number;
    createdByName?: string;
    modifiedByName?: string;
}

interface KeyValue {
    key: string;
    value: string;
}

interface IdTitle {
    id: number;
    title: string;
}

// QUESTION

export interface QuestionResponseOptionElement {
    key: string;
    value: string;
}

export interface QuestionElementFrameworkAttribute {
    matrix2dId?: number;
    type: 'sector' | 'dimension' | 'subsector' | 'subdimension';
    value?: Matrix2dFlatCellElement['id'];
    parentValue?: Matrix2dFlatCellElement['id']; // sector or dimension id
}

export type QuestionType = 'text'
    | 'integer'
    | 'decimal'
    | 'range'
    | 'select_one'
    | 'select_multiple'
    | 'rank'
    | 'geopoint'
    | 'geotrace'
    | 'geoshape'
    | 'date'
    | 'time'
    | 'dateTime'
    | 'file'
    | 'image'
    | 'audio'
    | 'video'
    | 'barcode'
    | 'calculate'
    | 'note'
    | 'acknowledge'
    | 'hidden';


export interface BaseQuestionElement {
    id: number;

    title: string;
    type: QuestionType;
    // label: string;
    enumeratorInstruction?: string;
    respondentInstruction?: string;

    responseOptions?: KeyValue[];

    enumeratorSkill?: string;
    enumeratorSkillDisplay?: string;
    dataCollectionTechnique?: string;
    dataCollectionTechniqueDisplay?: string;
    importance?: string;
    importanceDisplay?: string;
    crisisType?: number;
    crisisTypeDetail?: IdTitle;

    requiredDuration?: number;

    frameworkAttribute?: QuestionElementFrameworkAttribute;

    isArchived?: boolean;
    isRequired?: boolean;
}

export interface FrameworkQuestionElement extends BaseQuestionElement {
    analysisFramework: number;
}

export interface QuestionnaireQuestionElement extends BaseQuestionElement {
    questionnaire: number;
}

// QUESTIONNAIRES

export interface MiniQuestionnaireElement extends DbEntity {
    project: number;
    title: string;
    isArchived?: boolean;

    enumeratorSkill?: string;
    enumeratorSkillDisplay?: string;
    dataCollectionTechnique?: string;
    dataCollectionTechniqueDisplay?: string;
    crisisType?: number;
    crisisTypeDetail?: IdTitle;

    requiredDuration: number;

    activeQuestionsCount: number;
}

export interface QuestionnaireElement extends DbEntity {
    project: number;
    title: string;
    isArchived?: boolean;

    enumeratorSkill?: string;
    enumeratorSkillDisplay?: string;
    dataCollectionTechnique?: string;
    dataCollectionTechniqueDisplay?: string;
    crisisType?: number;
    crisisTypeDetail?: IdTitle;

    requiredDuration: number;

    // activeQuestionsCount: number;
    questions: QuestionnaireQuestionElement[];
    // projectFrameworkDetail: FrameworkElement;
}

// FRAMEWORK
export type MiniFrameworkElement = Pick<FrameworkElement, 'id' | 'widgets' | 'questions' | 'title'>

