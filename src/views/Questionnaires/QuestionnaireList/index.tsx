import React from 'react';
import Excel from 'exceljs/dist/exceljs.js';
import { saveAs } from 'file-saver';
import { _cs } from '@togglecorp/fujs';
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
    BaseQuestionElement,

    Requests,
    AddRequestProps,
    MultiResponse,
    QuestionnaireQuestionElement,
} from '#typings';

import { generateXLSForm, readXLSForm } from '#entities/questionnaire';

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
    body?: object;
    questions?: BaseQuestionElementWithoutId[];

    onExportReady?: (title: string, questions: QuestionnaireQuestionElement[]) => void;
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

    // Used by XLSForm Export
    questionnaireGetRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.GET,
        onSuccess: ({ response, params }) => {
            if (!params || !params.onExportReady) {
                return;
            }

            const questionnaire = response as QuestionnaireElement;

            // TODO: Order questions
            const {
                questions,
                title,
            } = questionnaire;
            const activeQuestions = questions.filter(question => !question.isArchived);

            params.onExportReady(title, activeQuestions);
        },
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
        disabled: (
            this.props.requests.questionnaireArchiveRequest.pending
            || this.props.requests.questionnaireDeleteRequest.pending
            || this.props.requests.questionnaireGetRequest.pending
        ),
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
        const firstFile = files[0];

        const reader = new FileReader();
        reader.readAsArrayBuffer(firstFile);
        reader.onload = () => {
            const buffer = reader.result as ArrayBuffer;

            const wb = new Excel.Workbook();
            wb.xlsx.load(buffer).then((workbook: Excel.Workbook) => {
                const { error, title, questions } = readXLSForm(workbook);

                if (error) {
                    // TODO: show error
                    console.error(error);
                    return;
                }

                // FIXME: questions should be created along with questionnaire
                // but there was some problem in server while creating questions
                // along with new questionnaire
                const body = {
                    title: title || firstFile.name,
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

    private handleXLSFormExport = (questionnaireId: number) => {
        this.props.requests.questionnaireGetRequest.do({
            questionnaireId,
            onExportReady: (title: string, questions: QuestionnaireQuestionElement[]) => {
                const workbook = generateXLSForm(
                    questionnaireId,
                    title,
                    questions,
                );

                workbook.xlsx.writeBuffer()
                    .then((data: BlobPart) => {
                        const blob = new Blob(
                            [data],
                            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
                        );
                        saveAs(blob, `${title} XLSForm.xlsx`);
                    })
                    .catch((ex: unknown) => {
                        console.error(ex);
                    });
            },
        });
    }

    private handleKoboToolboxExport = (questionnaireId: number) => {
        console.warn('Export to kobo', questionnaireId);
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
