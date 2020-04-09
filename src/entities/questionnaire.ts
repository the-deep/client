import Excel from 'exceljs/dist/exceljs.js';
import { listToMap, Obj, isDefined } from '@togglecorp/fujs';

import {
    FrameworkQuestionElement,
    Matrix2dWidgetElement,
    MiniFrameworkElement,
    BaseQuestionElement,
    QuestionType,
} from '#typings';

function escapeReplacementToken(title: string | undefined) {
    if (!title) {
        return title;
    }
    return title.replace(/\${([^{}]+)}/g, '#{$1}');
}

export interface TreeItem {
    key: string;
    parentKey?: string;
    title: string;
}

export const treeItemKeySelector = (item: TreeItem) => item.key;
export const treeItemParentKeySelector = (item: TreeItem) => item.parentKey;
export const treeItemLabelSelector = (item: TreeItem) => item.title;

export function getFrameworkMatrices(
    framework: MiniFrameworkElement | undefined,
    questions?: FrameworkQuestionElement[],
): TreeItem[] {
    if (!framework) {
        return [];
    }

    const matrix2dWidgets = framework.widgets.filter(
        widget => widget.widgetId === 'matrix2dWidget',
    ) as Matrix2dWidgetElement[];

    const matrices: TreeItem[] = matrix2dWidgets
        .map(widget => [
            {
                key: widget.key,
                title: widget.title || 'Untitled matrix',
                parentKey: undefined,
            },
            {
                key: `row-${widget.key}`,
                title: 'Row',
                parentKey: widget.key,
            },
            {
                key: `column-${widget.key}`,
                title: 'Column',
                parentKey: widget.key,
            },
        ])
        .flat();

    const dimensions: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.dimensions.map(dimension => ({
                key: dimension.id,
                title: dimension.title || 'Untitled row',
                parentKey: `row-${widget.key}`,
            }))
        ))
        .flat();

    const subdimensions: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.dimensions.map(dimension => (
                dimension.subdimensions.map(subdimension => ({
                    key: subdimension.id,
                    title: subdimension.title || 'Untitled sub row',
                    parentKey: dimension.id,
                }))
            )).flat()
        ))
        .flat();

    const sectors: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.sectors.map(sector => ({
                key: sector.id,
                title: sector.title || 'Untitled column',
                parentKey: `column-${widget.key}`,
            }))
        ))
        .flat();

    const subsectors: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.sectors.map(dimension => (
                dimension.subsectors.map(subdimension => ({
                    key: subdimension.id,
                    title: subdimension.title || 'Untitled sub column',
                    parentKey: dimension.id,
                }))
            )).flat()
        ))
        .flat();

    return [
        ...matrices,
        ...dimensions,
        ...sectors,
        ...subdimensions,
        ...subsectors,
    ];
}

export function getFilteredQuestions(
    questions: FrameworkQuestionElement[] | undefined,
    values: string[],
) {
    if (!questions || values.length <= 0) {
        return questions;
    }

    const filteredQuestions = questions.filter(question => (
        question.frameworkAttribute
        && question.frameworkAttribute.value
        && values.includes(question.frameworkAttribute.value)
    ));
    return filteredQuestions;
}

const metadataTypes = [
    'start', 'end', 'today', 'deviceid', 'subscriberid', 'simserial',
    'phonenumber', 'username', 'email', 'audit',
];

const groupTags = [
    'begin group', 'end group', 'repeat group',
];

const supportedTypes: QuestionType[] = [
    'text', 'integer', 'decimal',
    'range', 'select_one', 'select_multiple',
    'rank', 'geopoint', 'geotrace',
    'geoshape', 'date', 'time',
    'dateTime', 'file', 'image',
    'audio', 'video', 'barcode',
    // 'calculate', 'acknowledge', 'hidden',
];

export function isChoicedQuestionType(questionType: string) {
    const type = questionType as QuestionType;
    return ['select_one', 'select_multiple', 'rank'].includes(type);
}

export function isChoicedQuestion(question: BaseQuestionElement) {
    return isChoicedQuestionType(question.type);
}

export function generateXLSForm(id: number, title: string, questions: BaseQuestionElement[]) {
    const activeQuestions = questions.filter(question => !question.isArchived);

    const getColumns = ((columns: string[]) => (
        columns.map(col => ({
            key: col,
            header: col,
            width: 20,
        }))
    ));

    const workbook = new Excel.Workbook();

    // Sheets
    const survey = workbook.addWorksheet('survey');
    const choices = workbook.addWorksheet('choices');
    const settings = workbook.addWorksheet('settings');

    // Bold all column values
    survey.getRow(1).font = { bold: true };
    survey.columns = getColumns([
        'type', 'name', 'label', 'hint', 'default', 'read_only',
        'required', 'required_message', 'constraint', 'constraint_message', 'calculation', 'appearance',
        'parameters', 'body::accuracyThreshold', 'relevant',
    ]);

    choices.getRow(1).font = { bold: true };
    choices.columns = getColumns([
        'list name', 'name', 'label',
    ]);

    settings.getRow(1).font = { bold: true };
    settings.columns = getColumns([
        'form_title', 'form_id',
        'public_key', 'submission_url', 'default_language', 'style', 'version', 'allow_choice_duplicates', // extra
    ]);

    // Schema: Adding default meta
    survey.addRows(
        metadataTypes.map(meta => ({ type: meta, name: meta })),
    );
    // Schema: Add survey questions
    survey.addRows(
        activeQuestions.map((question) => {
            const questionKey = `question_${question.id}`;
            const questionChoiceKey = `${questionKey}_choices`;

            const hints = [];
            if (question.enumeratorInstruction) {
                hints.push(`Enumerator Instruction: ${question.enumeratorInstruction}`);
            }
            if (question.respondentInstruction) {
                hints.push(`Respondent Insturction: ${question.respondentInstruction}`);
            }

            // NOTE: we need to escape question.title
            return {
                // NOTE: Choice types requires choice name in type "type_name choice_key"
                type: isChoicedQuestion(question) ? `${question.type} ${questionChoiceKey}` : question.type,
                name: questionKey,
                label: escapeReplacementToken(question.title),
                required: question.isRequired ? 'yes' : '',
                hint: hints.join('; '),
            };
        }),
    );

    choices.addRows(
        activeQuestions
            .filter(isChoicedQuestion)
            .map((question) => {
                const questionKey = `question_${question.id}`;
                const questionChoiceKey = `${questionKey}_choices`;
                const options = question.responseOptions || [];
                return options.map(option => ({
                    'list name': questionChoiceKey,
                    name: option.key,
                    label: option.value,
                }));
            })
            .flat(),
    );

    // Add XForm Settings
    settings.addRow({
        form_title: title,
        form_id: `Form ${id}`,
    });

    return workbook;
}

export function readXLSForm(workbook: Excel.Workbook) {
    // NOTE: getRow(n).values always returns an array
    // NOTE: exceljs doesn't support getcell by header name for readonly

    type BaseQuestionElementWithoutId = Omit<BaseQuestionElement, 'id'>;

    interface SurveyColumn {
        type?: number;
        name?: number;
        label?: number;
        'label::English'?: number;
        required?: number;
    }

    interface ChoicesColumn {
        'list name'?: number;
        name?: number;
        label?: number;
        'label::English'?: number;
    }

    interface SettingsColumn {
        form_title?: number;
    }

    const getColumnsIndex = ((columns: string[]) => (
        listToMap(
            columns,
            column => column,
            (value, key, index) => index,
        )
    ));

    // NOTE: getRow(n).values always returns an array
    // NOTE: exceljs doesn't support getcell by header name for readonly

    const choices = workbook.getWorksheet('choices');
    if (!choices) {
        return { error: 'No choices tab' };
    }
    const choiceIndices = getColumnsIndex(
        choices.getRow(1).values as string[],
    ) as ChoicesColumn;
    const questionChoices: Obj<{ key: string; value: string }[]> = {};
    choices.eachRow((row, rowIndex: number) => {
        if (rowIndex === 1) {
            return;
        }

        const values = row.values as string[];

        const listNameIndex = choiceIndices['list name'];
        const nameIndex = choiceIndices.name;
        const labelIndex = choiceIndices.label;
        const labelEngIndex = choiceIndices['label::English'];

        const key = isDefined(listNameIndex) ? values[listNameIndex] : undefined;
        const name = isDefined(nameIndex) ? values[nameIndex] : undefined;
        const label = (isDefined(labelIndex) ? values[labelIndex] : undefined)
        || (isDefined(labelEngIndex) ? values[labelEngIndex] : undefined);

        if (!key || !name) {
            return;
        }

        const choice = {
            key: name,
            value: label || 'Untitled Choice',
        };

        if (!questionChoices[key]) {
            questionChoices[key] = [choice];
        } else {
            questionChoices[key].push(choice);
        }
    });

    const settings = workbook.getWorksheet('settings');
    if (!settings) {
        return { error: 'No settings tab' };
    }
    const settingsIndices = getColumnsIndex(
        settings.getRow(1).values as string[],
    ) as SettingsColumn;
    const formTitleIndex = settingsIndices.form_title;
    const formTitle = formTitleIndex
        ? (settings.getRow(2).values as string[])[formTitleIndex]
        : undefined;

    const survey = workbook.getWorksheet('survey');
    if (!survey) {
        return { error: 'No survey tab' };
    }
    const surveyIndices = getColumnsIndex(
        survey.getRow(1).values as string[],
    ) as SurveyColumn;
    const questions: BaseQuestionElementWithoutId[] = [];
    survey.eachRow((row, rowIndex: number) => {
        if (rowIndex === 1) {
            return;
        }

        const values = row.values as string[];

        const typeIndex = surveyIndices.type;
        const labelIndex = surveyIndices.label;
        const labelEngIndex = surveyIndices['label::English'];
        const requiredIndex = surveyIndices.required;

        const type = isDefined(typeIndex)
            ? values[typeIndex]
            : undefined;

        if (!type) {
            return;
        }

        const trimmedType = type.trim();

        if (groupTags.includes(trimmedType)) {
            // Ignore groups
            return;
        }

        if (metadataTypes.includes(type)) {
            // Ignore metadata types
            return;
        }

        const [questionType, choiceKey] = trimmedType.split(/\s+/); // 3rd option is orOther
        if (!supportedTypes.includes(questionType as QuestionType)) {
            // Ignore unsupported types
            return;
        }

        const question: BaseQuestionElementWithoutId = {
            type: questionType as QuestionType,
            title: (isDefined(labelIndex) ? values[labelIndex] : undefined)
                || (isDefined(labelEngIndex) ? values[labelEngIndex] : undefined)
                || 'Untitled Question',
            isRequired: (isDefined(requiredIndex) ? values[requiredIndex] : undefined) === 'yes',
            responseOptions: choiceKey ? questionChoices[choiceKey] || [] : undefined,
        };

        questions.push(question);
    });

    return { title: formTitle, questions };
}
