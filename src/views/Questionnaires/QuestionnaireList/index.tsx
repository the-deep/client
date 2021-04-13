import React from 'react';
import Excel from 'exceljs/dist/exceljs.js';
import { saveAs } from 'file-saver';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';

import Cloak from '#components/general/Cloak';
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

    Permissions,
} from '#typings';

import { generateXLSForm, readXLSForm } from '#entities/questionnaire';

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';
import {
    RequestClient,
    methods,
} from '#request';
import notify from '#notify';
import _ts from '#ts';

import Questionnaire from '#qbc/Questionnaire';
import styles from './styles.scss';

type BaseQuestionElementWithoutId = Omit<BaseQuestionElement, 'id' | 'order'>;

const ModalButton = modalize(PrimaryButton);

const MAX_QUESTIONNAIRE_PER_PAGE = 10;

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
    showCloneModal: boolean;
    questionnaireIdForClone?: number;
}

interface Params {
    archived?: boolean;
    donotReloadList?: boolean;
    questionnaireId?: number;
    setQuestionnaires?: (questionnaires: MiniQuestionnaireElement[], totalCount: number) => void;
    body?: Record<string, unknown>;
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
        onFailure: notifyOnFailure('Questionnaires'),
        onFatal: notifyOnFatal('Questionnaires'),
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
        onFailure: notifyOnFailure('Questionnaire Archive'),
        onFatal: notifyOnFatal('Questionnaire Archive'),
    },
    questionnaireDeleteRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.DELETE,
        onSuccess: ({ props, params }) => {
            if (params && !params.donotReloadList) {
                // NOTE: re-trigger questionnaire request
                props.requests.questionnairesGetRequest.do();
                props.onQuestionnaireMetaReload();
            }
        },
        onFailure: notifyOnFailure('Questionnaire Delete'),
        onFatal: notifyOnFatal('Questionnaire Delete'),
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
        // FIXME: handle error if available
        onFailure: notifyOnFailure('Questionnaire Create'),
        onFatal: notifyOnFatal('Questionnaire Create'),
    },
    // Used by XLSForm Import
    questionnairePatchRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.PATCH,
        body: ({ params }) => params && params.body,
        onSuccess: ({ props, response }) => {
            // NOTE: re-trigger questionnaire request
            props.requests.questionnairesGetRequest.do();
            const { title } = response as QuestionnaireElement;
            notify.send({
                type: notify.type.SUCCESS,
                title: 'Questionnaire',
                message: `Questionnaire ${title} was successfully created.`,
                duration: notify.duration.MEDIUM,
            });
            props.onQuestionnaireMetaReload();
        },
        onFailure: ({ props, params, error }) => {
            const typedError = error as { messageForNotification: string } | undefined;
            const messageArray = ['Failed to upload XLS Form.'];
            if (typedError) {
                messageArray.push(typedError.messageForNotification);
            }

            notify.send({
                title: 'Questionnaire',
                type: notify.type.ERROR,
                message: messageArray.join(' '),
                duration: notify.duration.SLOW,
            });

            if (params && params.questionnaireId) {
                props.requests.questionnaireDeleteRequest.do({
                    questionnaireId: params.questionnaireId,
                    donotReloadList: true,
                });
            }
        },
        onFatal: notifyOnFatal('Questionnaire Edit'),
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
        onFailure: notifyOnFailure('Questionnaire'),
        onFatal: notifyOnFatal('Questionnaire'),
    },
};

const questionnaireKeySelector = (q: MiniQuestionnaireElement) => q.id;

class QuestionnaireList extends React.PureComponent<Props, State> {
    private static isReadOnly = ({ setupPermissions }: Permissions) => !setupPermissions.modify;

    public constructor(props: Props) {
        super(props);
        this.state = {
            questionnaires: [],
            questionnaireCount: 0,

            showCloneModal: false,
            questionnaireIdForClone: undefined,
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
        onClone: this.handleClone,
        onEdit: this.handleEdit,
        onXLSFormExport: this.handleXLSFormExport,
    })

    private getCloneValue = (
        questionnaires: MiniQuestionnaireElement[],
        questionnaireIdForClone?: number,
    ) => (
        questionnaires.find(q => q.id === questionnaireIdForClone)
    )

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

    private handleClone = (questionnaireId: number) => {
        this.setState({
            showCloneModal: true,
            questionnaireIdForClone: questionnaireId,
        });
    }

    private handleQuestionnaireCloneClose = () => {
        this.setState({
            showCloneModal: false,
            questionnaireIdForClone: undefined,
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
        const {
            requests: {
                questionnairesGetRequest,
            },
            onQuestionnaireMetaReload,
        } = this.props;

        questionnairesGetRequest.do();
        onQuestionnaireMetaReload();
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
                    console.error(error);
                    notify.send({
                        title: 'XLS Import',
                        type: notify.type.ERROR,
                        message: error,
                        duration: notify.duration.MEDIUM,
                    });
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
        const {
            requests: {
                questionnaireGetRequest,
            },
        } = this.props;

        questionnaireGetRequest.do({
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
                        notify.send({
                            title: 'XLS Export',
                            type: notify.type.ERROR,
                            message: 'Some error occurred.',
                            duration: notify.duration.MEDIUM,
                        });
                    });
            },
        });
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
            showCloneModal,
            questionnaires,
            questionnaireCount,
            questionnaireIdForClone,
        } = this.state;

        const fileInputDisabled = createPending || patchPending;
        const cloneValue = this.getCloneValue(questionnaires, questionnaireIdForClone);

        return (
            <div className={_cs(className, styles.questionnaireList)}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        { title }
                    </h2>
                    {!archived && (
                        <Cloak
                            hide={QuestionnaireList.isReadOnly}
                            render={(
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
                        />
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
                {showCloneModal && (
                    <QuestionnaireModal
                        onRequestSuccess={
                            this.handleQuestionnaireFormRequestSuccess
                        }
                        closeModal={this.handleQuestionnaireCloneClose}
                        projectId={projectId}
                        value={cloneValue}
                        isClone
                    />
                )}
            </div>
        );
    }
}

export default RequestClient(requestOptions)(
    QuestionnaireList,
);
