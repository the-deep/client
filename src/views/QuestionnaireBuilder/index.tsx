import React from 'react';
import { connect } from 'react-redux';
import { produce } from 'immer';
import {
    _cs,
    compareNumber,
    reverseRoute,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import TextInput from '#rsci/TextInput';
import Button from '#rsu/../v2/Action/Button';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ResizableH from '#rscv/Resizable/ResizableH';
import VerticalTabs from '#rscv/VerticalTabs';

import Page from '#rscv/Page';

import {
    QuestionnaireElement,
    QuestionnaireQuestionElement,
    BaseQuestionElement,
    ViewComponent,

    MiniFrameworkElement,
    ProjectElement,

    AppState,
    Requests,
    AddRequestProps,
    BulkActionId,
    OrderAction,
} from '#typings';

import {
    methods,
    RequestCoordinator,
    RequestClient,
    notifyOnFailure,
    notifyOnFatal,
} from '#request';

import {
    questionnaireIdFromRouteSelector,
    projectIdFromRouteSelector,
    projectDetailsSelector,
} from '#redux';

import BackLink from '#components/general/BackLink';
import { getArrayMoveDetails } from '#utils/common';
import { pathNames } from '#constants';

import QuestionModalForQuestionnaire from '#qbc/QuestionModalForQuestionnaire';

import QuestionList from '#qbc/QuestionList';
import QuestionnairePreviewModal from '#qbc/QuestionnairePreviewModal';
import AddFromFramework from './AddFromFramework';
import Diagnostics from './Diagnostics';

import styles from './styles.scss';

const ModalButton = modalize(Button);

type TabElement = 'active' | 'archived';

const tabs: {[key in TabElement]: string} = {
    active: 'Active',
    archived: 'Parking Lot',
};

interface ComponentProps {
    className?: string;
    projectDetail: ProjectElement;
}

interface State {
    showQuestionFormModal: boolean;
    addFromFramework: boolean;
    questionToEdit?: QuestionnaireQuestionElement;
    newQuestionOrder?: number;
    questionnaire?: QuestionnaireElement;
    // FIXME: use this everywhere
    framework?: MiniFrameworkElement;
    treeFilter: string[];
    searchValue: string;
}

interface PropsFromAppState {
    questionnaireId: QuestionnaireElement['id'];
    projectId: number;
}

const mapStateToProps = (state: AppState) => ({
    questionnaireId: questionnaireIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),
    projectDetail: projectDetailsSelector(state),
});

type ComponentPropsWithAppState = PropsFromAppState & ComponentProps;

type CopyBody = {
    questionnaireId?: number;
    frameworkQuestionId?: number;
    newOrder?: number;
}

interface Params {
    setQuestionnaire?: (questionnaire: QuestionnaireElement) => void;
    setFramework?: (framework: MiniFrameworkElement) => void;

    questionId?: QuestionnaireQuestionElement['id'];
    onDeleteSuccess?: (questionId: QuestionnaireQuestionElement['id']) => void;

    body?: BulkActionId[];
    copyBody?: CopyBody;
    orderAction?: OrderAction;
    onBulkDeleteSuccess?: (questionIds: QuestionnaireQuestionElement['id'][]) => void;
    onBulkArchiveSuccess?: (questionIds: QuestionnaireQuestionElement['id'][], archiveStatus: boolean) => void;
    onBulkUnArchiveSuccess?: (questionIds: QuestionnaireQuestionElement['id'][], archiveStatus: boolean) => void;

    archive?: boolean;
    onArchiveSuccess?: (question: QuestionnaireQuestionElement) => void;
    onCopySuccess?: (question: QuestionnaireQuestionElement) => void;
    onCloneSuccess?: (question: QuestionnaireQuestionElement) => void;
}

const EmptyComponent = () => <div />;

const requestOptions: Requests<ComponentPropsWithAppState, Params> = {
    questionnaireGetRequest: {
        url: ({ props: { questionnaireId } }) => `/questionnaires/${questionnaireId}/`,
        onMount: true,
        method: methods.GET,
        onPropsChanged: ['questionnaireId'],
        onSuccess: ({ params, response }) => {
            if (!params || !params.setQuestionnaire) {
                return;
            }
            const questionnaire = response as QuestionnaireElement;
            params.setQuestionnaire(questionnaire);
        },
        onFailure: notifyOnFailure('Questionnaire'),
        onFatal: notifyOnFatal('Questionnaire'),
    },
    frameworkGetRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/analysis-framework/`,
        onMount: true,
        query: {
            fields: ['id', 'questions', 'widgets', 'title'],
        },
        onPropsChanged: ['projectId'],
        method: methods.GET,
        onSuccess: ({ params, response }) => {
            if (!params || !params.setFramework) {
                return;
            }
            const framework = response as MiniFrameworkElement;
            params.setFramework(framework);
        },
        onFailure: notifyOnFailure('Analysis Framework'),
        onFatal: notifyOnFatal('Analysis Framework'),
    },
    copyToQuestionnaireRequest: {
        url: ({ props: { questionnaireId } }) => (
            `/questionnaires/${questionnaireId}/questions/af-question-copy/`
        ),
        body: ({ params }) => params && params.copyBody,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onCopySuccess) {
                return;
            }
            params.onCopySuccess(response as QuestionnaireQuestionElement);
        },
        onFailure: notifyOnFailure('Questionnaire Duplicate'),
        onFatal: notifyOnFatal('Questionnaire Duplicate'),
    },
    questionDeleteRequest: {
        url: ({ props: { questionnaireId }, params }) => (
            `/questionnaires/${questionnaireId}/questions/${params && params.questionId}/`
        ),
        method: methods.DELETE,
        onSuccess: ({ params }) => {
            if (!params || !params.onDeleteSuccess || !params.questionId) {
                return;
            }
            params.onDeleteSuccess(params.questionId);
        },
        onFailure: notifyOnFailure('Question Delete'),
        onFatal: notifyOnFatal('Question Delete'),
    },
    orderChangeRequest: {
        url: ({ props: { questionnaireId }, params }) => (
            `/questionnaires/${questionnaireId}/questions/${params && params.questionId}/order/`
        ),
        method: methods.POST,
        body: ({ params }) => params && params.orderAction,
    },
    questionCloneRequest: {
        url: ({ props: { questionnaireId }, params }) => (
            `/questionnaires/${questionnaireId}/questions/${params && params.questionId}/clone/`
        ),
        body: ({ params }) => ({
            order_action: {
                action: 'below',
                value: params && params.questionId,
            },
        }),
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onCloneSuccess) {
                return;
            }
            params.onCloneSuccess(response as QuestionnaireQuestionElement);
        },
        onFailure: notifyOnFailure('Question Clone'),
        onFatal: notifyOnFatal('Question Clone'),
    },
    questionArchiveRequest: {
        url: ({ props: { questionnaireId }, params }) => (
            `/questionnaires/${questionnaireId}/questions/${params && params.questionId}/`
        ),
        method: methods.PATCH,
        body: ({ params }) => ({
            isArchived: params && params.archive,
        }),
        onSuccess: ({ params, response }) => {
            if (!params || !params.onArchiveSuccess) {
                return;
            }
            const question = response as QuestionnaireQuestionElement;
            params.onArchiveSuccess(question);
        },
        onFailure: notifyOnFailure('Question Archive'),
        onFatal: notifyOnFatal('Question Archive'),
    },
    bulkQuestionDeleteRequest: {
        url: ({ props: { questionnaireId } }) => (
            `/questionnaires/${questionnaireId}/questions/bulk-delete/`
        ),
        body: ({ params }) => params && params.body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkDeleteSuccess || !params.body) {
                return;
            }
            params.onBulkDeleteSuccess(response as number[]);
        },
        onFailure: notifyOnFailure('Questions Delete'),
        onFatal: notifyOnFatal('Questions Delete'),
    },
    bulkQuestionArchiveRequest: {
        url: ({ props: { questionnaireId } }) => (
            `/questionnaires/${questionnaireId}/questions/bulk-archive/`
        ),
        body: ({ params }) => params && params.body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkArchiveSuccess || !params.body) {
                return;
            }
            params.onBulkArchiveSuccess(response as number[], true);
        },
        onFailure: notifyOnFailure('Questions Archive'),
        onFatal: notifyOnFatal('Questions Archive'),
    },
    bulkQuestionUnArchiveRequest: {
        url: ({ props: { questionnaireId } }) => (
            `/questionnaires/${questionnaireId}/questions/bulk-unarchive/`
        ),
        body: ({ params }) => params && params.body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkUnArchiveSuccess || !params.body) {
                return;
            }
            params.onBulkUnArchiveSuccess(response as number[], false);
        },
        onFailure: notifyOnFailure('Questions Unarchive'),
        onFatal: notifyOnFatal('Questions Unarchive'),
    },
};

type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const questionKeySelector = (d: QuestionnaireQuestionElement) => d.id;

class QuestionnaireBuilder extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        const {
            requests: {
                questionnaireGetRequest,
                frameworkGetRequest,
            },
        } = this.props;

        this.state = {
            showQuestionFormModal: false,
            questionToEdit: undefined,
            newQuestionOrder: undefined,
            questionnaire: undefined,
            framework: undefined,
            treeFilter: [],
            addFromFramework: false,
            searchValue: '',
        };

        this.views = {
            active: {
                component: QuestionList,
                rendererParams: () => {
                    const {
                        requests: {
                            questionDeleteRequest,
                            questionArchiveRequest,
                            copyToQuestionnaireRequest,
                            bulkQuestionDeleteRequest,
                            bulkQuestionArchiveRequest,
                            bulkQuestionUnArchiveRequest,
                        },
                    } = this.props;

                    const {
                        framework,
                        questionnaire,
                        searchValue,
                    } = this.state;

                    return ({
                        title: 'Active Questions',
                        className: styles.questionList,
                        onAdd: this.handleAddQuestionButtonClick,
                        onEdit: this.handleEditQuestionButtonClick,
                        onAddButtonClick: this.handleAddNewQuestionButtonClick,
                        onOrderChange: this.handleOrderChange,
                        onDelete: this.handleDeleteQuestion,
                        onClone: this.handleCloneQuestion,
                        onCopyFromDrop: this.handleCopyFromDrop,
                        onArchive: this.handleArchiveQuestion,
                        onBulkDelete: this.handleBulkDelete,
                        onBulkArchive: this.handleBulkArchive,
                        framework,
                        questions: questionnaire
                            ? questionnaire.questions
                            : undefined,
                        showLoadingOverlay: questionDeleteRequest.pending
                            || questionArchiveRequest.pending
                            || copyToQuestionnaireRequest.pending
                            || bulkQuestionDeleteRequest.pending
                            || bulkQuestionArchiveRequest.pending
                            || bulkQuestionUnArchiveRequest.pending,
                        archived: false,
                        searchValue,
                    });
                },
            },
            archived: {
                component: QuestionList,
                rendererParams: () => {
                    const {
                        requests: {
                            questionDeleteRequest,
                            questionArchiveRequest,
                            copyToQuestionnaireRequest,
                            bulkQuestionDeleteRequest,
                            bulkQuestionArchiveRequest,
                            bulkQuestionUnArchiveRequest,
                        },
                    } = this.props;

                    const { searchValue } = this.state;

                    return ({
                        title: 'Parking Lot Questions',
                        className: styles.questionList,
                        onUnarchive: this.handleUnarchiveQuestion,
                        onBulkUnArchive: this.handleBulkUnArchive,
                        framework: this.state.framework,
                        questions: this.state.questionnaire
                            ? this.state.questionnaire.questions
                            : undefined,
                        showLoadingOverlay: questionDeleteRequest.pending
                            || questionArchiveRequest.pending
                            || copyToQuestionnaireRequest.pending
                            || bulkQuestionDeleteRequest.pending
                            || bulkQuestionArchiveRequest.pending
                            || bulkQuestionUnArchiveRequest.pending,
                        archived: true,
                        searchValue,
                    });
                },
            },
        };

        this.addViews = {
            active: {
                component: AddFromFramework,
                wrapContainer: true,
                rendererParams: () => {
                    const {
                        requests: {
                            questionDeleteRequest,
                            questionArchiveRequest,
                            copyToQuestionnaireRequest,
                            bulkQuestionDeleteRequest,
                            bulkQuestionArchiveRequest,
                            bulkQuestionUnArchiveRequest,
                        },
                    } = this.props;

                    const {
                        treeFilter,
                        framework,
                        searchValue,
                    } = this.state;

                    return ({
                        treeFilter,
                        framework,
                        searchValue,
                        onTreeInputChange: this.handleTreeInputChange,
                        onPaneClose: this.handleAddFromFrameworkClose,
                        onCopy: this.handleCopyClick,
                        copyDisabled: questionDeleteRequest.pending
                            || questionArchiveRequest.pending
                            || copyToQuestionnaireRequest.pending
                            || bulkQuestionDeleteRequest.pending
                            || bulkQuestionArchiveRequest.pending
                            || bulkQuestionUnArchiveRequest.pending,
                    });
                },
            },
            archived: {
                component: EmptyComponent,
            },
        };

        questionnaireGetRequest.setDefaultParams({
            setQuestionnaire: (questionnaire: QuestionnaireElement) => {
                this.setState({
                    questionnaire: {
                        ...questionnaire,
                        questions: [...questionnaire.questions].sort(
                            (a, b) => compareNumber(a.order, b.order),
                        ),
                    },
                });
            },
        });
        frameworkGetRequest.setDefaultParams({
            setFramework: (framework: MiniFrameworkElement) => {
                this.setState({ framework });
            },
        });
    }

    private views: {
        active: ViewComponent<React.ComponentProps<typeof QuestionList>>;
        archived: ViewComponent<React.ComponentProps<typeof QuestionList>>;
    }

    private addViews: {
        active: ViewComponent<React.ComponentProps<typeof AddFromFramework>>;
        archived: ViewComponent<React.ComponentProps<typeof EmptyComponent>>;
    }

    private handleCopyClick = (questionId: BaseQuestionElement['id']) => {
        const { questionnaire } = this.state;

        if (!questionnaire) {
            return;
        }

        const { id: questionnaireId } = questionnaire;

        const copyBody = {
            frameworkQuestionId: questionId,
            questionnaireId,
            order_action: {
                action: 'top',
            },
        };

        this.props.requests.copyToQuestionnaireRequest.do({
            onCopySuccess: this.handleCopySuccess,
            copyBody,
        });
    }

    private handleCopyFromDrop = (
        questionId: BaseQuestionElement['id'],
        afterQuestionId: number,
    ) => {
        const { questionnaire } = this.state;

        if (!questionnaire) {
            return;
        }

        const { id: questionnaireId } = questionnaire;

        const copyBody = {
            frameworkQuestionId: questionId,
            questionnaireId,
            order_action: {
                action: 'below',
                value: afterQuestionId,
            },
        };

        this.props.requests.copyToQuestionnaireRequest.do({
            onCopySuccess: this.handleCopySuccess,
            copyBody,
        });
    }

    private handleCopySuccess = (question: QuestionnaireQuestionElement) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            safeQuestionnaire.questions.splice(question.order, 0, question);
        });

        this.setState({ questionnaire: newQuestionnaire });
    }

    private handleCloneSuccess = (question: QuestionnaireQuestionElement) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            safeQuestionnaire.questions.splice(question.order, 0, question);
        });

        this.setState({ questionnaire: newQuestionnaire });
    }

    private handleAddQuestionButtonClick = () => {
        this.setState({
            showQuestionFormModal: true,
            questionToEdit: undefined,
        });
    }

    private handleEditQuestionButtonClick = (questionId: QuestionnaireQuestionElement['id']) => {
        const { questionnaire } = this.state;

        if (!questionnaire) {
            return;
        }

        const questionToEdit = questionnaire.questions.find(q => q.id === questionId);

        if (!questionToEdit) {
            return;
        }

        this.setState({
            showQuestionFormModal: true,
            questionToEdit,
        });
    }

    private handleAddNewQuestionButtonClick = (newQuestionOrder: number) => {
        const { questionnaire } = this.state;

        if (!questionnaire) {
            return;
        }

        this.setState({
            showQuestionFormModal: true,
            questionToEdit: undefined,
            newQuestionOrder,
        });
    }

    private handleDeleteQuestion = (questionId: QuestionnaireQuestionElement['id']) => {
        this.props.requests.questionDeleteRequest.do({
            questionId,
            onDeleteSuccess: this.handleQuestionDeleteRequestSuccess,
        });
    }

    private handleCloneQuestion = (questionId: QuestionnaireQuestionElement['id']) => {
        this.props.requests.questionCloneRequest.do({
            questionId,
            onCloneSuccess: this.handleCloneSuccess,
        });
    }

    private handleBulkDelete = (questionIds: BulkActionId[]) => {
        this.props.requests.bulkQuestionDeleteRequest.do({
            body: questionIds,
            onBulkDeleteSuccess: this.handleBulkQuestionDeleteSuccess,
        });
    }

    private handleBulkArchive = (questionIds: BulkActionId[]) => {
        this.props.requests.bulkQuestionArchiveRequest.do({
            body: questionIds,
            onBulkArchiveSuccess: this.handleBulkArchiveSuccess,
        });
    }

    private handleBulkUnArchive = (questionIds: BulkActionId[]) => {
        this.props.requests.bulkQuestionUnArchiveRequest.do({
            body: questionIds,
            onBulkUnArchiveSuccess: this.handleBulkArchiveSuccess,
        });
    }

    private handleArchiveQuestion = (questionId: QuestionnaireQuestionElement['id']) => {
        this.props.requests.questionArchiveRequest.do({
            questionId,
            archive: true,
            onArchiveSuccess: this.handleQuestionArchiveRequestSuccess,
        });
    }

    private handleUnarchiveQuestion = (questionId: QuestionnaireQuestionElement['id']) => {
        this.props.requests.questionArchiveRequest.do({
            questionId,
            archive: false,
            onArchiveSuccess: this.handleQuestionArchiveRequestSuccess,
        });
    }

    private handleCloseQuestionFormModalButtonClick = () => {
        this.setState({
            showQuestionFormModal: false,
            questionToEdit: undefined,
        });
    }

    private handleQuestionFormRequestSuccess = (question: QuestionnaireQuestionElement) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const { id: questionId } = question;

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            const { questions } = safeQuestionnaire;
            const selectedIndex = questions.findIndex(e => e.id === questionId);
            if (selectedIndex === -1) {
                safeQuestionnaire.questions.splice(question.order, 0, question);
            } else {
                // eslint-disable-next-line no-param-reassign
                safeQuestionnaire.questions[selectedIndex] = question;
            }
        });

        this.setState({
            questionnaire: newQuestionnaire,
            showQuestionFormModal: false,
            questionToEdit: undefined,
        });
    }

    private handleTreeInputChange = (value: string[]) => {
        this.setState({ treeFilter: value });
    }

    private handleOrderChange = (questions: QuestionnaireQuestionElement[]) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            // eslint-disable-next-line no-param-reassign
            safeQuestionnaire.questions = questions;
        });

        const { questions: oldQuestions } = questionnaire;
        const { questions: newQuestions } = newQuestionnaire;

        const arrayMoveData = getArrayMoveDetails(oldQuestions, newQuestions, questionKeySelector);

        const movedQuestion = arrayMoveData.movedData;
        const orderAction = {
            action: (arrayMoveData.top ? 'top' : 'below') as OrderAction['action'],
            value: arrayMoveData.afterData,
        };

        this.setState({
            questionnaire: newQuestionnaire,
        }, () => {
            this.props.requests.orderChangeRequest.do({
                questionId: movedQuestion,
                orderAction,
            });
        });
    }

    private handleQuestionDeleteRequestSuccess = (questionId: QuestionnaireQuestionElement['id']) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            const { questions } = safeQuestionnaire;
            const selectedIndex = questions.findIndex(e => e.id === questionId);
            if (selectedIndex !== -1) {
                // eslint-disable-next-line no-param-reassign
                safeQuestionnaire.questions.splice(selectedIndex, 1);
            }
        });

        this.setState({
            questionnaire: newQuestionnaire,
        });
    }

    private handleBulkQuestionDeleteSuccess = (questionIds: QuestionnaireQuestionElement['id'][]) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            const { questions } = safeQuestionnaire;

            questionIds.forEach((questionId: number) => {
                const selectedIndex = questions.findIndex(e => e.id === questionId);
                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeQuestionnaire.questions.splice(selectedIndex, 1);
                }
            });
        });

        this.setState({
            questionnaire: newQuestionnaire,
        });
    }

    private handleBulkArchiveSuccess = (questionIds: QuestionnaireQuestionElement['id'][], archiveStatus: boolean) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            const { questions } = safeQuestionnaire;

            questionIds.forEach((questionId: number) => {
                const selectedIndex = questions.findIndex(e => e.id === questionId);
                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeQuestionnaire.questions[selectedIndex].isArchived = archiveStatus;
                }
            });
        });

        this.setState({
            questionnaire: newQuestionnaire,
        });
    }

    private handleQuestionArchiveRequestSuccess = (question: QuestionnaireQuestionElement) => {
        const { questionnaire } = this.state;
        if (!questionnaire) {
            return;
        }

        const newQuestionnaire = produce(questionnaire, (safeQuestionnaire) => {
            const { questions } = safeQuestionnaire;
            const selectedIndex = questions.findIndex(e => e.id === question.id);
            if (selectedIndex !== -1) {
                // eslint-disable-next-line no-param-reassign
                safeQuestionnaire.questions[selectedIndex] = question;
            }
        });

        this.setState({
            questionnaire: newQuestionnaire,
        });
    }

    private tabsModifier = (itemKey: TabElement) => {
        const { questionnaire } = this.state;

        const totalCount = questionnaire
            ? questionnaire.questions.length
            : 0;
        const activeCount = questionnaire
            ? questionnaire.questions.filter(question => !question.isArchived).length
            : 0;

        const counts: {[key in TabElement]: number} = {
            active: activeCount,
            archived: totalCount - activeCount,
        };

        return (
            <div className={styles.tab}>
                <div className={styles.label}>
                    { tabs[itemKey] }
                </div>
                <div className={styles.count}>
                    { counts[itemKey] }
                </div>
            </div>
        );
    }

    private handleAddFromFrameworkClick = () => {
        this.setState({ addFromFramework: true });
    }

    private handleAddFromFrameworkClose = () => {
        this.setState({ addFromFramework: false });
    }

    private handleSearchValueChange = (searchValue: string) => {
        this.setState({ searchValue });
    }

    public render() {
        const {
            className,
            requests: {
                questionnaireGetRequest: {
                    pending: questionnaireGetPending,
                },
                frameworkGetRequest: {
                    pending: frameworkGetPending,
                },
                questionDeleteRequest: {
                    pending: questionDeletePending,
                },
                questionArchiveRequest: {
                    pending: questionArchivePending,
                },
            },
        } = this.props;

        const showLoadingOverlay = questionDeletePending || questionArchivePending;

        const {
            showQuestionFormModal,
            questionToEdit,
            newQuestionOrder,
            questionnaire,
            framework,
            addFromFramework,
            searchValue,
        } = this.state;

        if (questionnaireGetPending || frameworkGetPending) {
            return (
                <div className={_cs(styles.questionnaireBuilder, className)} >
                    <LoadingAnimation />
                </div>
            );
        }

        if (!questionnaire) {
            return (
                <div className={_cs(styles.questionnaireBuilder, className)} >
                    <Message>
                        {/* FIXME: use strings */}
                        Could not get questionnaire!
                    </Message>
                </div>
            );
        }

        const {
            id: questionnaireId,
            title,
            questions,
            crisisTypeDetail,
            dataCollectionTechniqueDisplay,
            enumeratorSkillDisplay,
            requiredDuration,
        } = questionnaire;

        const activeTab = window.location.hash;
        const closedMode = activeTab === '#/archived' || !addFromFramework;

        return (
            <>
                <Page
                    className={_cs(styles.questionnaireBuilder, className)}
                    headerAboveSidebar
                    headerClassName={styles.header}
                    header={(
                        <>
                            <BackLink
                                className={styles.backLink}
                                defaultLink={reverseRoute(pathNames.homeScreen, {})}
                            />
                            <h2 className={styles.heading}>
                                {title}
                            </h2>
                            <TextInput
                                className={styles.filter}
                                label="Search"
                                placeholder="Type to search"
                                value={searchValue}
                                onChange={this.handleSearchValueChange}
                                showHintAndError={false}
                            />
                            <ModalButton
                                modal={
                                    <QuestionnairePreviewModal
                                        title={title}
                                        questionnaireId={questionnaireId}
                                    />
                                }
                            >
                                Preview
                            </ModalButton>
                        </>
                    )}
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <Diagnostics
                                frameworkTitle={framework ? framework.title : '-'}
                                crisisTypeDetail={crisisTypeDetail}
                                dataCollectionTechniqueDisplay={dataCollectionTechniqueDisplay}
                                enumeratorSkillDisplay={enumeratorSkillDisplay}
                                questions={questions}
                                requiredDuration={requiredDuration}
                                showLoadingOverlay={showLoadingOverlay}
                                title={title}
                            />
                            <div className={styles.questionStatus}>
                                <header className={styles.header}>
                                    <h4 className={styles.heading}>
                                        Question Status
                                    </h4>
                                </header>
                                <VerticalTabs
                                    tabs={tabs}
                                    useHash
                                    replaceHistory
                                    modifier={this.tabsModifier}
                                />
                            </div>
                            {activeTab === '#/active' && (
                                <div className={styles.buttonContainer}>
                                    <Button
                                        className={styles.addButton}
                                        onClick={this.handleAddFromFrameworkClick}
                                        iconName="add"
                                        disabled={addFromFramework}
                                    >
                                        Add From Framework
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <ResizableH
                            className={_cs(
                                styles.resizableContainer,
                                addFromFramework && styles.addMode,
                                closedMode && styles.closedMode,
                            )}
                            leftContainerClassName={styles.left}
                            rightContainerClassName={styles.right}
                            rightChild={(
                                <MultiViewContainer
                                    views={this.views}
                                    useHash
                                />
                            )}
                            leftChild={(
                                <MultiViewContainer
                                    containerClassName={styles.addPane}
                                    views={this.addViews}
                                    useHash
                                />
                            )}
                            disabled={!addFromFramework}
                        />
                    )}
                />
                {showQuestionFormModal && (
                    <QuestionModalForQuestionnaire
                        value={questionToEdit}
                        questionnaire={questionnaire}
                        newQuestionOrder={newQuestionOrder}
                        questionnaireId={questionnaireId}
                        onRequestSuccess={this.handleQuestionFormRequestSuccess}
                        closeModal={this.handleCloseQuestionFormModalButtonClick}
                        framework={framework}
                    />
                )}
            </>
        );
    }
}

export default connect(mapStateToProps)(
    RequestCoordinator(
        RequestClient(requestOptions)(
            QuestionnaireBuilder,
        ),
    ),
);
