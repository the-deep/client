import {
    WidgetElement,
    Matrix2dFlatCellElement,
} from './framework';

export interface Meta {
    crisisType?: string;
    enumeratorSkill?: string;
    dataCollectionTechnique?: string;
    requiredDuration?: number;
}

export interface QuestionnaireMeta extends Meta {
    title?: string;
}

export interface QuestionnaireItem extends QuestionnaireMeta {
    id: number;
    numberOfQuestions: number;
    dateCreated: string;
    frameworkId: number;
}

export interface ResponseOptionElement {
}

export type QuestionType = 'text' | 'number' | 'dateAndTime' | 'select' | 'rank' | 'location' | 'image' | 'audio' | 'video' | 'file' | 'barcode' | 'range' | 'note' | 'url' | 'printer' | 'acknowledge' | 'signature';

export interface QuestionMeta extends Meta {
    label?: string;
    importance?: number;
}

export interface QuestionElement extends QuestionMeta {
    id: number | undefined;
    title?: string;
    responseOptionList: ResponseOptionElement[];
    type: QuestionType | undefined;
    enumeratorInstruction?: string;
    respondentInstruction?: string;
    frameworkId: number | undefined;
    frameworkAttribute: {
        matrix2dId?: WidgetElement['id'];
        type: 'sector' | 'dimension' | 'subsector' | 'subdimension';
        value?: Matrix2dFlatCellElement['id'];
        parentValue?: Matrix2dFlatCellElement['id']; // sector or dimension id
    };
}

