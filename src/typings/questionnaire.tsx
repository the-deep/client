import {
    WidgetElement,
    Matrix2dFlatCellElement,
    FrameworkElement,
} from './framework';

export interface Meta {
    crisisType?: string;
    enumeratorSkill?: string;
    dataCollectionTechnique?: string;
    requiredDuration?: number;
}

export interface QuestionnaireMeta extends Meta {}

export interface QuestionnaireFormElement extends QuestionnaireMeta {}

export interface QuestionnaireElement extends QuestionnaireMeta {
    id?: number;
    title?: string;
    isArchived?: boolean;
    createdAt?: string;
    questions: QuestionElement[];
    projectFrameworkDetail: FrameworkElement;
}

export interface QuestionnaireItem extends QuestionnaireMeta {
    id: number;
    title?: string;
    numberOfQuestions: number;
    dateCreated: string;
    frameworkId: number;
    questions: QuestionElement[];
    createdAt: string;

    crisisTypeDetail?: {
        title: string;
    };
    dataCollectionTechniqueDetail?: {
        value: string;
    };
    enumeratorSkillDetail?: {
        value: string;
    };
}

export interface ResponseOptionElement {
}

export type QuestionType = 'text' | 'number' | 'dateAndTime' | 'select' | 'rank' | 'location' | 'image' | 'audio' | 'video' | 'file' | 'barcode' | 'range' | 'note' | 'url' | 'printer' | 'acknowledge' | 'signature';

export interface QuestionMeta extends Meta {
    label?: string;
    importance?: number;
}

export interface QuestionResponseOptionElement {
    key: string;
    value: string;
}

export interface QuestionFormElementFrameworkAttriute {
    matrix2dId?: WidgetElement['id'];
    type: 'sector' | 'dimension' | 'subsector' | 'subdimension';
    value?: Matrix2dFlatCellElement['id'];
    parentValue?: Matrix2dFlatCellElement['id']; // sector or dimension id
}

export interface QuestionFormElement extends QuestionMeta {
    enumeratorInstruction?: string;
    frameworkAttribute: QuestionFormElementFrameworkAttriute;
    frameworkId?: number;
    importance?: number;
    label?: string;
    respondentInstruction?: string;
    responseOptionList: ResponseOptionElement[];
    title?: string;
    type?: QuestionType;
}

export interface QuestionElementFrameworkAttribute {
    matrix2dId?: WidgetElement['id'];
    type: 'sector' | 'dimension' | 'subsector' | 'subdimension';
    value?: Matrix2dFlatCellElement['id'];
    parentValue?: Matrix2dFlatCellElement['id']; // sector or dimension id
}

export interface QuestionElement extends QuestionMeta {
    id: number | undefined;
    title?: string;
    responseOptionList: ResponseOptionElement[];
    type: QuestionType | undefined;
    enumeratorInstruction?: string;
    respondentInstruction?: string;
    frameworkId: number | undefined;
    frameworkAttribute: QuestionElementFrameworkAttribute;
}

