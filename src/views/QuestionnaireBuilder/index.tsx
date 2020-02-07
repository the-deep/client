import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { produce } from 'immer';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import MultiViewContainer from '#rscv/MultiViewContainer';
import VerticalTabs from '#rscv/VerticalTabs';
import ListView from '#rsu/../v2/View/ListView';
import TreeInput from '#rsu/../v2/Input/TreeInput';

import Page from '#rscv/Page';

import {
    QuestionnaireElement,
    FrameworkQuestionElement,
    QuestionnaireQuestionElement,
    BaseQuestionElement,

    MiniFrameworkElement,
    ProjectElement,

    AppState,
    Requests,
    AddRequestProps,
} from '#typings';

import {
    getPending,
    methods,
    RequestCoordinator,
    RequestClient,
} from '#request';

import {
    questionnaireIdFromRouteSelector,
    projectIdFromRouteSelector,
    projectDetailsSelector,
} from '#redux';

import {
    getFrameworkMatrices,
    getFilteredQuestions,

    treeItemKeySelector,
    treeItemLabelSelector,
    treeItemParentKeySelector,
} from '#entities/questionnaire';

import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import Question from '#qbc/Question';
import QuestionModalForQuestionnaire from '#qbc/QuestionModalForQuestionnaire';

import QuestionList from '#qbc/QuestionList';
import Diagnostics from './Diagnostics';

import styles from './styles.scss';

const questionKeySelector = (q: BaseQuestionElement) => q.id;

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
    questionToEdit?: QuestionnaireQuestionElement;
    questionnaire?: QuestionnaireElement;
    // FIXME: use this everywhere
    framework?: MiniFrameworkElement;
    treeFilter: string[];
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

    body?: QuestionnaireQuestionElement['id'][];
    copyBody?: QuestionnaireQuestionElement['id'][];
    onBulkDeleteSuccess?: (questionIds: QuestionnaireQuestionElement['id'][]) => void;
    onBulkArchiveSuccess?: (questionIds: QuestionnaireQuestionElement['id'][], archiveStatus: boolean) => void;
    onBulkUnArchiveSuccess?: (questionIds: QuestionnaireQuestionElement['id'][], archiveStatus: boolean) => void;

    archive?: boolean;
    onArchiveSuccess?: (question: QuestionnaireQuestionElement) => void;
    onCopySuccess?: (question: QuestionnaireQuestionElement) => void;
}

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
            console.warn(question);
            params.onArchiveSuccess(question);
        },
    },
    bulkQuestionDeleteRequest: {
        url: ({ props: { questionnaireId } }) => (
            `/questionnaires/${questionnaireId}/questions/bulk-delete/`
        ),
        body: ({ params: { body } }) => body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkDeleteSuccess || !params.body) {
                return;
            }
            params.onBulkDeleteSuccess(response as number[]);
        },
    },
    bulkQuestionArchiveRequest: {
        url: ({ props: { questionnaireId } }) => (
            `/questionnaires/${questionnaireId}/questions/bulk-archive/`
        ),
        body: ({ params: { body } }) => body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkArchiveSuccess || !params.body) {
                return;
            }
            params.onBulkArchiveSuccess(response as number[], true);
        },
    },
    bulkQuestionUnArchiveRequest: {
        url: ({ props: { questionnaireId } }) => (
            `/questionnaires/${questionnaireId}/questions/bulk-unarchive/`
        ),
        body: ({ params: { body } }) => body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkUnArchiveSuccess || !params.body) {
                return;
            }
            params.onBulkUnArchiveSuccess(response as number[], false);
        },
    },
};

type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

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
            questionnaire: undefined,
            framework: undefined,
            treeFilter: [],
        };

        questionnaireGetRequest.setDefaultParams({
            setQuestionnaire: (questionnaire: QuestionnaireElement) => {
                this.setState({ questionnaire });
            },
        });
        frameworkGetRequest.setDefaultParams({
            setFramework: (framework: MiniFrameworkElement) => {
                this.setState({ framework });
            },
        });
    }

    private getFrameworkQuestionRendererParams = (
        key: FrameworkQuestionElement['id'],
        question: FrameworkQuestionElement,
    ) => {
        const { framework } = this.state;
        const { requests } = this.props;
        const copyDisabled = getPending(requests, 'copyToQuestionnaireRequest');

        return {
            data: question,
            framework: framework as MiniFrameworkElement,
            className: styles.frameworkQuestion,
            onCopy: this.handleCopyClick,
            copyDisabled,
            expanded: false,
            readOnly: true,
        };
    }

    private getFrameworkMatrices = memoize(getFrameworkMatrices)

    private getFilteredQuestions = memoize(getFilteredQuestions)

    private views = {
        active: {
            component: QuestionList,
            rendererParams: () => ({
                title: 'Active Questions',
                className: styles.questionList,
                onAdd: this.handleAddQuestionButtonClick,
                onEdit: this.handleEditQuestionButtonClick,
                onDelete: this.handleDeleteQuestion,
                onArchive: this.handleArchiveQuestion,
                onBulkDelete: this.handleBulkDelete,
                onBulkArchive: this.handleBulkArchive,
                framework: this.state.framework,
                questions: this.state.questionnaire
                    ? this.state.questionnaire.questions
                    : undefined,
                showLoadingOverlay: this.props.requests.questionDeleteRequest.pending
                    || this.props.requests.questionArchiveRequest.pending,
                archived: false,
            }),
        },
        archived: {
            component: QuestionList,
            rendererParams: () => ({
                title: 'Parking Lot Questions',
                className: styles.questionList,
                onUnarchive: this.handleUnarchiveQuestion,
                onBulkUnArchive: this.handleBulkUnArchive,
                framework: this.state.framework,
                questions: this.state.questionnaire
                    ? this.state.questionnaire.questions
                    : undefined,
                showLoadingOverlay: this.props.requests.questionDeleteRequest.pending
                    || this.props.requests.questionArchiveRequest.pending,
                archived: true,
            }),
        },
    }

    private addViews = {
        active: {
            component: () => {
                const {
                    framework,
                    treeFilter,
                } = this.state;

                if (!framework) {
                    return null;
                }

                return (
                    <div className={styles.content}>
                        <h3> Add from Framework </h3>
                        <h4> Matrices </h4>
                        <TreeInput
                            className={styles.matrixFilter}
                            keySelector={treeItemKeySelector}
                            parentKeySelector={treeItemParentKeySelector}
                            labelSelector={treeItemLabelSelector}
                            onChange={this.handleTreeInputChange}
                            value={treeFilter}
                            options={this.getFrameworkMatrices(framework)}
                            defaultCollapseLevel={0}
                        />
                        <h4> Questions </h4>
                        <ListView
                            className={styles.frameworkQuestionList}
                            rendererParams={this.getFrameworkQuestionRendererParams}
                            renderer={Question}
                            data={
                                this.getFilteredQuestions(
                                    framework.questions,
                                    treeFilter,
                                )
                            }
                            keySelector={questionKeySelector}
                            filtered={treeFilter.length > 0}
                        />
                    </div>
                );
            },
        },
        archived: {
            component: () => <div />,
        },
    }

    private handleCopyClick = (questionId: BaseQuestionElement['id']) => {
        const {
            questionnaire: {
                id: questionnaireId,
                questions,
            },
        } = this.state;

        const newOrder = questions ? 1 : questions.length + 1;

        const copyBody = {
            frameworkQuestionId: questionId,
            questionnaireId,
            newOrder,
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
            safeQuestionnaire.questions.push(question);
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

    private handleDeleteQuestion = (questionId: QuestionnaireQuestionElement['id']) => {
        this.props.requests.questionDeleteRequest.do({
            questionId,
            onDeleteSuccess: this.handleQuestionDeleteRequestSuccess,
        });
    }

    private handleBulkDelete = (questionIds: QuestionnaireQuestionElement['id'][]) => {
        this.props.requests.bulkQuestionDeleteRequest.do({
            body: questionIds,
            onBulkDeleteSuccess: this.handleBulkQuestionDeleteSuccess,
        });
    }

    private handleBulkArchive = (questionIds: QuestionnaireQuestionElement['id'][]) => {
        this.props.requests.bulkQuestionArchiveRequest.do({
            body: questionIds,
            onBulkArchiveSuccess: this.handleBulkArchiveSuccess,
        });
    }

    private handleBulkUnArchive = (questionIds: QuestionnaireQuestionElement['id'][]) => {
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
                safeQuestionnaire.questions.push(question);
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
            projectDetail,
        } = this.props;

        const showLoadingOverlay = questionDeletePending || questionArchivePending;

        const {
            showQuestionFormModal,
            questionToEdit,
            questionnaire,
            framework,
            treeFilter,
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
                        </>
                    )}
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <div className={styles.projectDetails}>
                                <h4 className={styles.heading}>
                                    Project
                                </h4>
                                <div className={styles.value}>
                                    { projectDetail.title || '-'}
                                </div>
                                <h4 className={styles.heading}>
                                    Analysis Framework
                                </h4>
                                <div className={styles.value}>
                                    { framework ? framework.title : '-' }
                                </div>
                            </div>
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
                            <MultiViewContainer
                                views={this.addViews}
                                useHash
                            />
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <>
                            <MultiViewContainer
                                views={this.views}
                                useHash
                            />
                            <Diagnostics
                                className={styles.rightPanel}
                                crisisTypeDetail={crisisTypeDetail}
                                dataCollectionTechniqueDisplay={dataCollectionTechniqueDisplay}
                                enumeratorSkillDisplay={enumeratorSkillDisplay}
                                questions={questions}
                                requiredDuration={requiredDuration}
                                showLoadingOverlay={showLoadingOverlay}
                                title={title}
                            />
                        </>
                    )}
                />
                {showQuestionFormModal && (
                    <QuestionModalForQuestionnaire
                        value={questionToEdit}
                        questionnaire={questionnaire}
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
