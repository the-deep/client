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

export interface IdTitle {
    id: number;
    title: string;
}

// QUESTION
//

interface ResponseOptionValue {
    defaultLabel: string;
    [key: string]: string;
}

export interface QuestionResponseOptionElement {
    key: string;
    value: ResponseOptionValue;
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
    | 'barcode';
/*
    | 'calculate'
    | 'note'
    | 'acknowledge'
    | 'hidden';
*/

interface MoreTitles {
    [key: string]: string;
}

export interface BaseQuestionElement {
    id: number;
    order: number;

    title: string;
    name: string;
    moreTitles: MoreTitles;
    type: QuestionType;
    // label: string;
    enumeratorInstruction?: string;
    respondentInstruction?: string;

    responseOptions?: QuestionResponseOptionElement[];

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
    attributeTitle?: string;

    isArchived?: boolean;
    isRequired?: boolean;
}

export interface BulkActionId {
    id: BaseQuestionElement['id'];
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
    dataCollectionTechniques?: string;
    dataCollectionTechniquesDisplay?: string[];
    crisisTypes?: number[];
    crisisTypesDetail?: IdTitle[];

    requiredDuration: number;

    activeQuestionsCount: number;
}

export interface QuestionnaireElement extends DbEntity {
    project: number;
    title: string;
    isArchived?: boolean;

    enumeratorSkill?: string;
    enumeratorSkillDisplay?: string;
    dataCollectionTechniques?: string;
    dataCollectionTechniquesDisplay?: string[];
    crisisTypes?: number[];
    crisisTypesDetail?: IdTitle[];

    requiredDuration: number;

    // activeQuestionsCount: number;
    questions: QuestionnaireQuestionElement[];
    // projectFrameworkDetail: FrameworkElement;
}

export interface OrderAction {
    action: 'top' | 'bottom' | 'above' | 'below';
    value?: number;
}

export interface Language {
    key: string;
    label: string;
}

export interface LanguageTitle {
    key: string;
    uniqueKey: string;
    title: string;
}

// FRAMEWORK
export type MiniFrameworkElement = Pick<FrameworkElement, 'id' | 'widgets' | 'questions' | 'title'>

export interface QuestionnaireOptions {
    enumeratorSkillOptions?: unknown[];
    dataCollectionTechniqueOptions?: unknown[];
    crisisTypeOptions?: unknown[];
    questionTypeOptions?: unknown[];
    questionImportanceOptions?: unknown[];
}
