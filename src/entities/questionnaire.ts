import Excel from 'exceljs/dist/exceljs.js';
import {
    listToMap,
    Obj,
    sum,
    isDefined,
    isNotDefined,
    caseInsensitiveSubmatch,
    isFalsyString,
} from '@togglecorp/fujs';

import {
    FrameworkQuestionElement,
    Matrix2dWidgetElement,
    MiniFrameworkElement,
    BaseQuestionElement,
    QuestionType,
    QuestionElementFrameworkAttribute,
    Language,
    QuestionResponseOptionElement,
} from '#types';

interface Row {
    values: string[];
}

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
    totalCount?: number;
}

export const treeItemKeySelector = (item: TreeItem) => item.key;
export const treeItemParentKeySelector = (item: TreeItem) => item.parentKey;
export const treeItemLabelSelector = (item: TreeItem) => (
    isDefined(item.totalCount) && item.totalCount > 0 ? `${item.title} (${item.totalCount})` : item.title
);

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

    const dimensions: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.dimensions.map(dimension => ({
                key: dimension.id,
                title: dimension.title || 'Untitled row',
                parentKey: `row-${widget.key}`,
                totalCount: questions && questions.filter((question) => {
                    const { frameworkAttribute } = question;
                    if (!frameworkAttribute) {
                        return false;
                    }

                    return (
                        (frameworkAttribute.type === 'subdimension' && frameworkAttribute.parentValue === dimension.id)
                        || (frameworkAttribute.type === 'dimension' && frameworkAttribute.value === dimension.id)
                    );
                }).length,
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
                    totalCount: questions && questions.filter((question) => {
                        const { frameworkAttribute } = question;
                        if (!frameworkAttribute) {
                            return false;
                        }

                        return frameworkAttribute.type === 'subdimension' && frameworkAttribute.value === dimension.id;
                    }).length,
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
                totalCount: questions && questions.filter((question) => {
                    const { frameworkAttribute } = question;
                    if (!frameworkAttribute) {
                        return false;
                    }

                    return (
                        (frameworkAttribute.type === 'subsector' && frameworkAttribute.parentValue === sector.id)
                        || (frameworkAttribute.type === 'sector' && frameworkAttribute.value === sector.id)
                    );
                }).length,
            }))
        ))
        .flat();

    const subsectors: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.sectors.map(sector => (
                sector.subsectors.map(subsector => ({
                    key: subsector.id,
                    title: subsector.title || 'Untitled sub column',
                    parentKey: sector.id,
                    totalCount: questions && questions.filter((question) => {
                        const { frameworkAttribute } = question;
                        if (!frameworkAttribute) {
                            return false;
                        }

                        return frameworkAttribute.type === 'subsector' && frameworkAttribute.value === sector.id;
                    }).length,
                }))
            )).flat()
        ))
        .flat();

    const rowCount = sum(dimensions.map(item => item.totalCount).filter(isDefined));
    const columnCount = sum(sectors.map(item => item.totalCount).filter(isDefined));
    const totalCount = rowCount + columnCount;

    const matrices: TreeItem[] = matrix2dWidgets
        .map(widget => [
            {
                key: widget.key,
                title: widget.title || 'Untitled matrix',
                parentKey: undefined,
                totalCount,
            },
            {
                key: `row-${widget.key}`,
                title: 'Row',
                parentKey: widget.key,
                totalCount: rowCount,
            },
            {
                key: `column-${widget.key}`,
                title: 'Column',
                parentKey: widget.key,
                totalCount: columnCount,
            },
        ])
        .flat();

    return [
        ...matrices,
        ...dimensions,
        ...sectors,
        ...subdimensions,
        ...subsectors,
    ];
}

export function getFilteredQuestions<T extends BaseQuestionElement>(
    questions: T[] | undefined,
    frameworkAttributes?: string[],
    searchValue?: string,
    archived?: boolean,
) {
    const allFiltersEmpty = frameworkAttributes && frameworkAttributes.length <= 0
        && isFalsyString(searchValue)
        && archived === undefined;

    if (!questions || allFiltersEmpty) {
        return questions;
    }

    const filteredQuestions = questions.filter((question) => {
        const jointMoreTitles = question.moreTitles
            ? Object.values(question.moreTitles).join('\n') : '';

        const responseOptions = question.responseOptions || [];
        const jointResponseOptions = responseOptions.map(ro => (
            Object.values(ro.value).join('\n')
        )).join('\n');

        const searchFilter = isFalsyString(searchValue)
            || caseInsensitiveSubmatch(question.title, searchValue)
            || caseInsensitiveSubmatch(jointMoreTitles, searchValue)
            || caseInsensitiveSubmatch(jointResponseOptions, searchValue)
            || caseInsensitiveSubmatch(question.name, searchValue)
            || caseInsensitiveSubmatch(question.dataCollectionTechniqueDisplay, searchValue)
            || caseInsensitiveSubmatch(question.enumeratorSkillDisplay, searchValue)
            || caseInsensitiveSubmatch(question.respondentInstruction, searchValue)
            || caseInsensitiveSubmatch(question.enumeratorInstruction, searchValue)
            || caseInsensitiveSubmatch(question.attributeTitle, searchValue)
            || (question.crisisTypeDetail && caseInsensitiveSubmatch(
                question.crisisTypeDetail.title,
                searchValue,
            ));

        const frameworkAttributeFilter = (!frameworkAttributes || frameworkAttributes.length <= 0)
            || (
                question.frameworkAttribute
                && question.frameworkAttribute.value
                && frameworkAttributes.includes(question.frameworkAttribute.value)
            );

        const archiveFilter = archived === undefined
            || archived === !!question.isArchived;

        return searchFilter && frameworkAttributeFilter && archiveFilter;
    });
    return filteredQuestions;
}

export const languageOptions: Language[] = [
    {
        key: 'en',
        label: 'English',
    },
    {
        key: 'arb',
        label: 'Arabic',
    },
    {
        key: 'fr',
        label: 'French',
    },
    {
        key: 'es',
        label: 'Spanish',
    },
];

export const languageOptionsMap = listToMap(
    languageOptions,
    d => d.key,
    d => d.label,
);

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
        'type', 'name', 'label',
        ...languageOptions.map(langOpt => `label::${langOpt.label} (${langOpt.key})`),
        'hint', 'default', 'read_only',
        'required', 'required_message', 'constraint', 'constraint_message',
        'calculation', 'appearance', 'parameters', 'body::accuracyThreshold',
        'relevant',
    ]);

    choices.getRow(1).font = { bold: true };
    choices.columns = getColumns([
        'list name', 'name', 'label',
        ...languageOptions.map(langOpt => `label::${langOpt.label} (${langOpt.key})`),
    ]);

    settings.getRow(1).font = { bold: true };
    settings.columns = getColumns([
        'form_title', 'form_id', 'public_key', 'submission_url',
        'default_language', 'style', 'version', 'allow_choice_duplicates', // extra
    ]);

    // Schema: Adding default meta
    survey.addRows(
        metadataTypes.map(meta => ({ type: meta, name: meta })),
    );
    // Schema: Add survey questions
    survey.addRows(
        activeQuestions.map((question) => {
            const questionChoiceKey = `${question.name}_choices`;

            const hints = [];
            if (question.enumeratorInstruction) {
                hints.push(`Enumerator Instruction: ${question.enumeratorInstruction}`);
            }
            if (question.respondentInstruction) {
                hints.push(`Respondent Instruction: ${question.respondentInstruction}`);
            }

            const labelsInOtherLanguages = listToMap(
                languageOptions,
                langOpt => `label::${langOpt.label} (${langOpt.key})`,
                langOpt => question.moreTitles[langOpt.key],
            );

            // NOTE: we need to escape question.title
            return {
                // NOTE: Choice types requires choice name in type "type_name choice_key"
                type: isChoicedQuestion(question) ? `${question.type} ${questionChoiceKey}` : question.type,
                name: question.name,
                label: escapeReplacementToken(question.title),
                required: question.isRequired ? 'yes' : '',
                hint: hints.join('; '),
                // Label in other languages
                ...labelsInOtherLanguages,
            };
        }),
    );

    choices.addRows(
        activeQuestions
            .filter(isChoicedQuestion)
            .map((question) => {
                const questionChoiceKey = `${question.name}_choices`;
                const options = question.responseOptions || [];
                return options.map(option => ({
                    'list name': questionChoiceKey,
                    name: option.key,
                    label: option.value.defaultLabel,
                    // Label in other languages
                    ...listToMap(
                        languageOptions,
                        langOpt => `label::${langOpt.label} (${langOpt.key})`,
                        langOpt => option.value[langOpt.key],
                    ),
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

export function generateDurationLabel(duration?: number) {
    if (isNotDefined(duration)) {
        return 'N/A';
    }
    const durationSec = duration % 60;
    const durationMin = Math.floor(duration / 60);

    if (durationMin === 0) {
        return `${durationSec} sec`;
    }

    if (durationSec === 0) {
        return `${durationMin} min`;
    }

    return `${durationMin} min ${durationSec} sec`;
}

export function readXLSForm(workbook: Excel.Workbook) {
    // NOTE: getRow(n).values always returns an array
    // NOTE: exceljs doesn't support getcell by header name for readonly

    type BaseQuestionElementWithoutId = Omit<BaseQuestionElement, 'id' | 'order'>;

    interface SurveyColumn {
        type?: number;
        name: number;
        label?: number;
        required?: number;
        [key: string]: number | undefined;
    }

    interface ChoicesColumn {
        'list name'?: number;
        name?: number;
        label?: number;
        [key: string]: number | undefined;
    }

    interface SettingsColumn {
        // eslint-disable-next-line camelcase
        form_title?: number;
    }

    const getColumnsIndex = ((columns: string[]) => (
        listToMap(
            columns,
            column => column,
            (value, key, index) => index,
        )
    ));

    // NOTE: exceljs doesn't support getcell by header name for readonly

    const choices = workbook.getWorksheet('choices');
    if (!choices) {
        return { error: 'No choices tab' };
    }
    const choiceIndices = getColumnsIndex(
        (choices.getRow(1) as Row).values,
    ) as ChoicesColumn;
    const questionChoices: Obj<QuestionResponseOptionElement[]> = {};

    choices.eachRow((row: Row, rowIndex: number) => {
        if (rowIndex === 1) {
            return;
        }

        const { values } = row;

        const listNameIndex = choiceIndices['list name'];
        const nameIndex = choiceIndices.name;
        const labelIndex = choiceIndices.label;

        const key = isDefined(listNameIndex) ? values[listNameIndex] : undefined;
        const name = isDefined(nameIndex) ? values[nameIndex] : undefined;
        const label = (isDefined(labelIndex) ? values[labelIndex] : undefined);

        if (!key || !name) {
            return;
        }

        const languageOptionsForValue = listToMap(
            languageOptions,
            langOpt => langOpt.key,
            (langOpt) => {
                const index = choiceIndices[`label::${langOpt.label} (${langOpt.key})`];

                if (isNotDefined(index)) {
                    return '';
                }
                return values[index];
            },
        );

        const choice: QuestionResponseOptionElement = {
            key: name,
            value: {
                ...languageOptionsForValue,
                defaultLabel: label || 'Untitled Choice',
            },
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
        (settings.getRow(1) as Row).values,
    ) as SettingsColumn;
    const formTitleIndex = settingsIndices.form_title;
    const formTitle = formTitleIndex
        ? ((settings.getRow(2) as Row).values)[formTitleIndex]
        : undefined;

    const survey = workbook.getWorksheet('survey');
    if (!survey) {
        return { error: 'No survey tab' };
    }
    const surveyIndices = getColumnsIndex(
        (survey.getRow(1) as Row).values,
    ) as SurveyColumn;
    const questions: BaseQuestionElementWithoutId[] = [];
    survey.eachRow((row: Row, rowIndex: number) => {
        if (rowIndex === 1) {
            return;
        }

        const { values } = row;

        const typeIndex = surveyIndices.type;
        const labelIndex = surveyIndices.label;
        const nameIndex = surveyIndices.name;
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

        const moreTitles = listToMap(
            languageOptions,
            langOpt => langOpt.key,
            (langOpt) => {
                const index = choiceIndices[`label::${langOpt.label} (${langOpt.key})`];

                if (isNotDefined(index)) {
                    return '';
                }
                return values[index];
            },
        );

        const question: BaseQuestionElementWithoutId = {
            type: questionType as QuestionType,
            name: values[nameIndex],
            title: (isDefined(labelIndex) ? values[labelIndex] : undefined) || 'Untitled Question',
            moreTitles,
            isRequired: (isDefined(requiredIndex) ? values[requiredIndex] : undefined) === 'yes',
            responseOptions: choiceKey ? questionChoices[choiceKey] || [] : undefined,
        };

        questions.push(question);
    });

    return { title: formTitle, questions };
}

interface ItemWithTitle {
    id: string | number;
    title?: string;
}

export const getQuestionAttributeTitle = (
    type: QuestionElementFrameworkAttribute['type'],
    value: QuestionElementFrameworkAttribute['value'],
    sectorList: ItemWithTitle[],
    subsectorList: ItemWithTitle[],
    dimensionList: ItemWithTitle[],
    subdimensionList: ItemWithTitle[],
) => {
    const dataSource = {
        sector: sectorList,
        subsector: subsectorList,
        dimension: dimensionList,
        subdimension: subdimensionList,
    };

    const attribute = dataSource[type].find(d => d.id === value);
    return attribute ? attribute.title : '';
};
