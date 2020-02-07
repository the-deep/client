import React from 'react';
import Excel from 'exceljs';
import { saveAs } from 'file-saver';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import modalize from '#rscg/Modalize';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';

import QuestionnaireModal from '#qbc/QuestionnaireModal';

import {
    MiniQuestionnaireElement,
    QuestionnaireElement,
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
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
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
        const surveyDefaultMeta = ['start', 'end', 'today', 'deviceid', 'subscriberid', 'simserial', 'phonenumber'];
        survey.addRows(
            surveyDefaultMeta.map(meta => ({ type: meta, name: meta })),
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
                        <ModalButton
                            modal={
                                <QuestionnaireModal
                                    onRequestSuccess={this.handleQuestionnaireFormRequestSuccess}
                                    projectId={projectId}
                                />
                            }
                        >
                            {_ts('project.questionnaire.list', 'addQuestionnaireButtonLabel')}
                        </ModalButton>
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
