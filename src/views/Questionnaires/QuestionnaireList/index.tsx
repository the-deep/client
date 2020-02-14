import React from 'react';
import Excel from 'exceljs';
import { saveAs } from 'file-saver';
import { _cs, listToMap, Obj, isDefined } from '@togglecorp/fujs';
import { produce } from 'immer';

import Icon from '#rscg/Icon';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import modalize from '#rscg/Modalize';
import ListView from '#rsu/../v2/View/ListView';
import Pager from '#rscv/Pager';
import FileInput from '#rsci/FileInput';

import QuestionnaireModal from '#qbc/QuestionnaireModal';

import {
    MiniQuestionnaireElement,
    QuestionnaireElement,
    QuestionType,
    BaseQuestionElement,

    Requests,
    AddRequestProps,
    MultiResponse,
} from '#typings';

import {
    RequestClient,
    methods,
} from '#request';
import _ts from '#ts';

import Questionnaire from '#qbc/Questionnaire';
import styles from './styles.scss';

type BaseQuestionElementWithoutId = Omit<BaseQuestionElement, 'id'>;

const ModalButton = modalize(PrimaryButton);

const MAX_QUESTIONNAIRE_PER_PAGE = 10;

type ViewMode = 'active' | 'archived';

interface ComponentProps {
    className?: string;
    title: string;
    projectId: number;
    archived: boolean;
    onQuestionnaireMetaReload: () => void;
    activePage: number;
    onActivePageChange: (page: number) => void;
}

interface State {
    questionnaires: MiniQuestionnaireElement[];
    questionnaireCount: number;
}

interface Params {
    archived?: boolean;
    questionnaireId?: number;
    setQuestionnaires?: (questionnaires: MiniQuestionnaireElement[], totalCount: number) => void;
    onQuestionsLoad?: (questionnaire: QuestionnaireElement) => void;
    body?: object;
    questions?: BaseQuestionElementWithoutId[];
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnairesGetRequest: {
        url: '/questionnaires/',
        query: ({ props }) => ({
            project: props.projectId,
            is_archived: props.archived,
            offset: (props.activePage - 1) * MAX_QUESTIONNAIRE_PER_PAGE,
            limit: MAX_QUESTIONNAIRE_PER_PAGE,
        }),
        // FIXME: use `/projects/<id>/questionnaires/` api
        onPropsChanged: ['projectId', 'archived', 'activePage'],
        method: methods.GET,
        onMount: true,
        onSuccess: ({ response, params }) => {
            if (!params || !params.setQuestionnaires) {
                return;
            }

            const questionnaireResponse = response as MultiResponse<MiniQuestionnaireElement>;
            const { results, count } = questionnaireResponse;
            params.setQuestionnaires(results, count);
        },
        // FIXME: write onFailure, onFatal
    },
    questionnaireGetRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.GET,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onQuestionsLoad) {
                return;
            }
            const questionnaire = response as QuestionnaireElement;
            params.onQuestionsLoad(questionnaire);
        },
    },
    questionnaireArchiveRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.PATCH,
        body: ({ params }) => {
            if (!params) {
                return {};
            }
            return {
                isArchived: params.archived,
            };
        },
        onSuccess: ({ props }) => {
            // NOTE: re-trigger questionnaire request
            props.requests.questionnairesGetRequest.do();
            props.onQuestionnaireMetaReload();
        },
        // FIXME: write onFailure, onFatal
    },
    questionnaireDeleteRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.DELETE,
        onSuccess: ({ props }) => {
            // NOTE: re-trigger questionnaire request
            props.requests.questionnairesGetRequest.do();
            props.onQuestionnaireMetaReload();
        },
        // FIXME: write onFailure, onFatal
    },

    // Used by XLSForm Import
    questionnaireCreateRequest: {
        url: '/questionnaires/',
        method: methods.POST,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            response,
            params,
            props,
        }) => {
            if (!params || !params.questions) {
                return;
            }

            const questionnaire = response as QuestionnaireElement;
            props.requests.questionnairePatchRequest.do({
                questionnaireId: questionnaire.id,
                body: {
                    questions: params.questions.map(question => ({
                        ...question,
                        questionnaire: questionnaire.id,
                    })),
                },
            });
        },
    },
    // Used by XLSForm Import
    questionnairePatchRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.PATCH,
        body: ({ params }) => params && params.body,
        onSuccess: ({ props }) => {
            // NOTE: re-trigger questionnaire request
            props.requests.questionnairesGetRequest.do();
            props.onQuestionnaireMetaReload();
        },
    },
};

const questionnaireKeySelector = (q: MiniQuestionnaireElement) => q.id;

const xFormXls = {
    // pre-defined types
    surveyDefaultMeta: ['start', 'end', 'today', 'deviceid', 'subscriberid', 'simserial', 'phonenumber'],
    surveyGroup: ['begin group', 'end group', 'repeat group'],
};

class QuestionnaireList extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            questionnaires: [],
            questionnaireCount: 0,
        };

        this.props.requests.questionnairesGetRequest.setDefaultParams({
            setQuestionnaires: (
                questionnaires: MiniQuestionnaireElement[],
                questionnaireCount: number,
            ) => {
                this.setState({
                    questionnaires,
                    questionnaireCount,
                });
            },
        });
    }

    private getQuestionnaireRendererParams = (
        key: MiniQuestionnaireElement['id'],
        questionnaire: MiniQuestionnaireElement,
    ) => ({
        questionnaireKey: key,
        data: questionnaire,
        archived: this.props.archived,
        disabled: this.props.requests.questionnaireArchiveRequest.pending,
        onArchive: this.handleArchive,
        onUnarchive: this.handleUnarchive,
        onDelete: this.handleDelete,
        onEdit: this.handleEdit,
        onXLSFormExport: this.handleXLSFormExport,
        onKoboToolboxExport: this.handleKoboToolboxExport,
    })

    private handleArchive = (questionnaireId: number) => {
        this.props.requests.questionnaireArchiveRequest.do({
            questionnaireId,
            archived: true,
        });
    }

    private handleUnarchive = (questionnaireId: number) => {
        this.props.requests.questionnaireArchiveRequest.do({
            questionnaireId,
            archived: false,
        });
    }

    private handleDelete = (questionnaireId: number) => {
        this.props.requests.questionnaireDeleteRequest.do({
            questionnaireId,
        });
    }

    private handleQuestionnaireFormRequestSuccess = () => {
        // NOTE: re-trigger questionnaire request
        this.props.requests.questionnairesGetRequest.do();
        this.props.onQuestionnaireMetaReload();
    }

    private handleImportXLSForm = (files: File[]) => {
        if (files.length <= 0) {
            console.warn('No file was selected');
            return;
        }

        // TODO: filter elements which are not string
        const getColumnsIndex = ((columns: string[]) => (
            listToMap(
                columns,
                column => column,
                (value, key, index) => index,
            )
        ));

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

        const wb = new Excel.Workbook();
        const reader = new FileReader();

        const firstFile = files[0];

        reader.readAsArrayBuffer(firstFile);
        reader.onload = () => {
            const buffer = reader.result as ArrayBuffer;
            wb.xlsx.load(buffer).then((workbook) => {
                // NOTE: getRow(n).values always returns an array
                // NOTE: exceljs doesn't support getcell by header name for readonly

                const choices = workbook.getWorksheet('choices');
                if (!choices) {
                    console.error('No choices tab');
                    return;
                }
                const choiceIndices = getColumnsIndex(
                    choices.getRow(1).values as string[],
                ) as ChoicesColumn;
                const questionChoices: Obj<{ key: string; value: string }[]> = {};
                choices.eachRow((row, rowIndex) => {
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
                    console.error('No settings tab');
                    return;
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
                    console.error('No survey tab');
                    return;
                }
                const surveyIndices = getColumnsIndex(
                    survey.getRow(1).values as string[],
                ) as SurveyColumn;
                // TODO: Pull it from options
                const supported_types: QuestionType[] = [
                    'text', 'integer', 'decimal',
                    'range', 'select_one', 'select_multiple',
                    'rank', 'geopoint', 'geotrace',
                    'geoshape', 'date', 'time',
                    'dateTime', 'file', 'image',
                    'audio', 'video', 'barcode',
                    // 'calculate', 'acknowledge', 'hidden',
                ];
                const questions: BaseQuestionElementWithoutId[] = [];
                survey.eachRow((row, rowIndex) => {
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

                    if (xFormXls.surveyGroup.includes(trimmedType)) {
                        // Ignore groups
                        return;
                    }

                    if (xFormXls.surveyDefaultMeta.includes(type)) {
                        // Ignore metadata types
                        return;
                    }

                    const [questionType, choiceKey] = trimmedType.split(/\s+/); // 3rd option is orOther
                    if (!supported_types.includes(questionType as QuestionType)) {
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

                // FIXME: questions should be created along with questionnaire
                // but there was some problem in server while creating questions
                // along with new questionnaire
                const body = {
                    title: formTitle || firstFile.name,
                    project: this.props.projectId,
                    requiredDuration: 0,
                };

                this.props.requests.questionnaireCreateRequest.do({
                    body,
                    questions,
                });
            });
        };
    }

    private handleEdit = (questionnaire: MiniQuestionnaireElement) => {
        const { questionnaires } = this.state;
        const { id: questionnaireId } = questionnaire;

        const newQuestionnaires = produce(questionnaires,
            (safeQuestionnaires: MiniQuestionnaireElement[]) => {
                const selectedIndex = safeQuestionnaires.findIndex(e => e.id === questionnaireId);
                if (selectedIndex === -1) {
                    return;
                }
                // eslint-disable-next-line no-param-reassign
                safeQuestionnaires[selectedIndex] = questionnaire;
            });

        this.setState({ questionnaires: newQuestionnaires });
    }

    private exportQuestionsToXLSForm = (questionnaire: QuestionnaireElement) => {
        // TODO: Order questions
        const { questions } = questionnaire;
        const activeQuestions = questions.filter(question => !question.isArchived);

        const getColumns = ((columns: string[]) => (
            columns.map(col => ({
                key: col,
                header: col,
                width: 20,
            }))
        ));

        const hasChoices = (question: BaseQuestionElement) => (
            ['select_one', 'select_multiple', 'rank'].includes(question.type)
        );

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
            xFormXls.surveyDefaultMeta.map(meta => ({ type: meta, name: meta })),
        );
        // Schema: Add survey questions
        survey.addRows(
            activeQuestions.map((question) => {
                const questionKey = `question_${question.id}`;
                const questionChoiceKey = `${questionKey}_choices`;
                return {
                    // NOTE: Choice types requires choice name in type "type_name choice_key"
                    type: hasChoices(question) ? `${question.type} ${questionChoiceKey}` : question.type,
                    name: questionKey,
                    label: question.title,
                    required: question.isRequired ? 'yes' : '',
                };
            }),
        );

        choices.addRows(
            activeQuestions
                .filter(hasChoices)
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
            form_title: questionnaire.title,
            form_id: `Form ${questionnaire.id}`,
        });

        // Save file to local
        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob(
                [data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            );
            saveAs(blob, `${questionnaire.title} XForm Export.xlsx`);
        });
    }

    private handleXLSFormExport = (questionnaireId: number) => {
        this.props.requests.questionnaireGetRequest.do({
            questionnaireId,
            onQuestionsLoad: this.exportQuestionsToXLSForm,
        });
    }

    private handleKoboToolboxExport = (questionnaireId: number) => {
        // TODO: TODO
        console.warn(questionnaireId);
    }

    public render() {
        const {
            className,
            title,
            projectId,
            archived,
            requests: {
                questionnairesGetRequest: {
                    pending,
                },
                questionnaireCreateRequest: {
                    pending: createPending,
                },
                questionnairePatchRequest: {
                    pending: patchPending,
                },
            },
            activePage,
            onActivePageChange,
        } = this.props;

        const {
            questionnaires,
            questionnaireCount,
        } = this.state;

        const fileInputDisabled = createPending || patchPending;

        return (
            <div className={_cs(className, styles.questionnaireList)}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        { title }
                    </h2>
                    {!archived && (
                        <div className={styles.actions}>
                            <FileInput
                                className={styles.fileInput}
                                onChange={this.handleImportXLSForm}
                                showStatus={false}
                                value=""
                                accept=".xlsx"
                                disabled={fileInputDisabled}
                            >
                                <div className={_cs(
                                    fileInputDisabled && styles.disabled,
                                    styles.fileInputButton,
                                )}
                                >
                                    <Icon
                                        className={styles.icon}
                                        name="upload"
                                    />
                                    <div className={styles.text}>
                                        {_ts('project.questionnaire.list', 'importQuestionnaireFromXLSFormButtonLabel')}
                                    </div>
                                </div>
                            </FileInput>
                            <ModalButton
                                disabled={createPending || patchPending}
                                className={styles.button}
                                modal={
                                    <QuestionnaireModal
                                        onRequestSuccess={
                                            this.handleQuestionnaireFormRequestSuccess
                                        }
                                        projectId={projectId}
                                    />
                                }
                            >
                                {_ts('project.questionnaire.list', 'addQuestionnaireButtonLabel')}
                            </ModalButton>
                        </div>
                    )}
                </header>
                <ListView
                    className={styles.content}
                    data={questionnaires}
                    renderer={Questionnaire}
                    rendererParams={this.getQuestionnaireRendererParams}
                    keySelector={questionnaireKeySelector}
                    pending={pending || createPending || patchPending}
                />
                <footer className={styles.footer}>
                    <Pager
                        activePage={activePage}
                        itemsCount={questionnaireCount}
                        maxItemsPerPage={MAX_QUESTIONNAIRE_PER_PAGE}
                        showItemsPerPageChange={false}
                        onPageClick={onActivePageChange}
                    />
                </footer>
            </div>
        );
    }
}

export default RequestClient(requestOptions)(
    QuestionnaireList,
);
