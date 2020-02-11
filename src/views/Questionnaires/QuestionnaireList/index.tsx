import React from 'react';
import Excel from 'exceljs';
import { saveAs } from 'file-saver';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';

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
    onSuccess?: (questionnaire: QuestionnaireElement) => void;
    body?: object;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    // Used by XLSForm Import
    questionnaireCreateRequest: {
        url: '/questionnaires/',
        method: methods.POST,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            response,
            params: { onSuccess } = {},
        }) => {
            if (onSuccess) onSuccess(response as QuestionnaireElement);
        },
        // TODO: onFailure, onFatal
    },
    questionnairePutRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.PUT,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            response,
        }) => {
            // TODO: Show success message or show new questionnaire
            console.warn(response);
        },
        // TODO: onFailure, onFatal
    },

    questionnaireRequest: {
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
            props.requests.questionnaireRequest.do();
            props.onQuestionnaireMetaReload();
        },
        // FIXME: write onFailure, onFatal
    },
    questionnaireDeleteRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.DELETE,
        onSuccess: ({ props }) => {
            // NOTE: re-trigger questionnaire request
            props.requests.questionnaireRequest.do();
            props.onQuestionnaireMetaReload();
        },
        // FIXME: write onFailure, onFatal
    },
};

const questionnaireKeySelector = (q: MiniQuestionnaireElement) => q.id;

class QuestionnaireList extends React.PureComponent<Props, State> {
    static xFormXls = {
        surveyDefaultMeta: ['start', 'end', 'today', 'deviceid', 'subscriberid', 'simserial', 'phonenumber'],
    }

    public constructor(props: Props) {
        super(props);
        this.state = {
            questionnaires: [],
            questionnaireCount: 0,
        };

        this.props.requests.questionnaireRequest.setDefaultParams({
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
        this.props.requests.questionnaireRequest.do();
    }

    private handleImportXLSForm = (files: File[]) => {
        if (files.length <= 0) return;

        const wb = new Excel.Workbook();
        const reader = new FileReader();

        const getColumnsIndex = ((columns: string[]) => (
            columns.reduce((acc, col, index) => ({
                ...acc,
                [col]: index,
            }), {})
        ));

        reader.readAsArrayBuffer(files[0]);
        reader.onload = () => {
            const buffer = reader.result as ArrayBuffer;
            wb.xlsx.load(buffer).then((workbook) => {
                const survey = workbook.getWorksheet('survey');
                const choices = workbook.getWorksheet('choices');
                const settings = workbook.getWorksheet('settings');

                // exceljs doesn't support getcell by header name for readonly
                const surveyCol = getColumnsIndex(survey.getRow(1).values as string[]) as {
                    type: number;
                    name: number;
                    label: number;
                    'label::English': number;
                    required: number;
                };
                const choicesCol = getColumnsIndex(choices.getRow(1).values as string[]) as {
                    'list name': number;
                    name: number;
                    label: number;
                    'label::English': number;
                };
                const settingsCol = getColumnsIndex(settings.getRow(1).values as string[]) as {
                    form_title: number;
                };

                const questions: BaseQuestionElementWithoutId[] = [];
                const questionChoices: {[key: string]: { key: string; value: string }[]} = {};

                const formTitle = (settings.getRow(2).values as string[])[settingsCol.form_title];

                choices.eachRow((row, rowIndex) => {
                    if (rowIndex === 1) return;
                    const v = row.values as [];
                    const key = v[choicesCol['list name']];
                    const name = v[choicesCol.name] as string;
                    const label = v[choicesCol.label] || v[choicesCol['label::English']] as string;
                    const choice = { key: name, value: label };

                    if (!(key in questionChoices)) {
                        questionChoices[key] = [choice];
                    } else {
                        questionChoices[key].push(choice);
                    }
                });

                // TODO: Pull it from options
                const supported_types = [
                    'text', 'integer', 'decimal',
                    'range', 'select_one', 'select_multiple',
                    'rank', 'geopoint', 'geotrace',
                    'geoshape', 'date', 'time',
                    'dateTime', 'file', 'image',
                    'audio', 'video', 'barcode',
                    'calculate', 'acknowledge', 'hidden',
                ];

                survey.eachRow((row, rowIndex) => {
                    if (rowIndex === 1) return;
                    const v = row.values as [];
                    const type = v[surveyCol.type] as QuestionType;

                    if (
                        QuestionnaireList.xFormXls.surveyDefaultMeta.includes(type) ||
                        // Deep Questionnaire doesn't support grouping/repeat
                        type.match(/^(begin|end)\s\w+/)
                    ) return;

                    const question: BaseQuestionElementWithoutId = {
                        type,
                        title: v[surveyCol.label] || v[choicesCol['label::English']],
                        isRequired: v[surveyCol.required] === 'yes',
                    };

                    const selectRegex = /^(?<type>select_one|select_multiple|rank)\s(?<choiceKey>\w+)(\s(?<orOther>or_other))?/;
                    const match = question.type.trim().match(selectRegex);
                    if (match && match.groups) {
                        question.type = match.groups.type as QuestionType;
                        question.responseOptions = questionChoices[match.groups.choiceKey] || [];
                        // question.allowOther = match.groups.orOther != undefined;
                    }

                    if (!supported_types.includes(question.type)) return;

                    questions.push(question);
                });

                const body = {
                    title: formTitle,
                    project: this.props.projectId,
                };

                this.props.requests.questionnaireCreateRequest.do({
                    body,
                    onSuccess: (questionnaire: QuestionnaireElement) => (
                        // PUT Questions after Questionnaire is created
                        this.props.requests.questionnairePutRequest.do({
                            questionnaireId: questionnaire.id,
                            body: {
                                ...body,
                                id: questionnaire.id,
                                questions: questions.map(question => ({
                                    ...question,
                                    questionnaire: questionnaire.id,
                                })),
                            },
                        })
                    ),
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
            QuestionnaireList.xFormXls.surveyDefaultMeta.map(meta => ({ type: meta, name: meta })),
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
                questionnaireRequest: {
                    pending,
                },
            },
            activePage,
            onActivePageChange,
        } = this.props;

        const {
            questionnaires,
            questionnaireCount,
        } = this.state;

        return (
            <div className={_cs(className, styles.questionnaireList)}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        { title }
                    </h2>
                    {!archived && (
                        <div>
                            <ModalButton
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
                            <FileInput
                                // className={styles.fileInput}
                                onChange={this.handleImportXLSForm}
                                showStatus={false}
                                value=""
                                accept=".xlsx"
                            >
                                {_ts('project.questionnaire.list', 'importQuestionnaireFromXLSFormButtonLabel')}
                            </FileInput>
                        </div>
                    )}
                </header>
                <ListView
                    className={styles.content}
                    data={questionnaires}
                    renderer={Questionnaire}
                    rendererParams={this.getQuestionnaireRendererParams}
                    keySelector={questionnaireKeySelector}
                    pending={pending}
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
