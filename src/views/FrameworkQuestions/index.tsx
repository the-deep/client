import React from 'react';
import { connect } from 'react-redux';
import { produce } from 'immer';
import memoize from 'memoize-one';

import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import MultiViewContainer from '#rscv/MultiViewContainer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import Page from '#rscv/Page';
import VerticalTabs from '#rscv/VerticalTabs';
import TreeInput from '#rsu/../v2/Input/TreeInput';

import {
    methods,
    RequestCoordinator,
    RequestClient,
} from '#request';
import { pathNames } from '#constants';
import {
    FrameworkQuestionElement,
    MiniFrameworkElement,
    ViewComponent,

    Requests,
    AddRequestProps,
    AppState,
    AppProps,
    BulkActionId,
} from '#typings';
import { afIdFromRouteSelector } from '#redux';

import {
    getFrameworkMatrices,
    getFilteredQuestions,

    treeItemKeySelector,
    treeItemLabelSelector,
    treeItemParentKeySelector,
} from '#entities/questionnaire';

import BackLink from '#components/general/BackLink';

import QuestionList from '#qbc/QuestionList';
import QuestionModalForFramework from '#qbc/QuestionModalForFramework';

import styles from './styles.scss';

type TabElement = 'active' | 'archived';
const tabs: {[key in TabElement]: string} = {
    active: 'Active',
    archived: 'Parking Lot',
};

interface ComponentProps {
    className?: string;
}

interface PropsFromAppState {
    frameworkId: MiniFrameworkElement['id'];
}

interface Params {
    setFramework?: (framework: MiniFrameworkElement) => void;

    questionId?: FrameworkQuestionElement['id'];
    onDeleteSuccess?: (questionId: FrameworkQuestionElement['id']) => void;

    body?: BulkActionId[];
    onBulkDeleteSuccess?: (questionIds: FrameworkQuestionElement['id'][]) => void;
    onBulkArchiveSuccess?: (questionIds: FrameworkQuestionElement['id'][], archiveStatus: boolean) => void;
    onBulkUnArchiveSuccess?: (questionIds: FrameworkQuestionElement['id'][], archiveStatus: boolean) => void;

    archive?: boolean;
    onArchiveSuccess?: (question: FrameworkQuestionElement) => void;
}

interface State {
    showQuestionModal: boolean;
    questionToEdit: FrameworkQuestionElement | undefined;
    treeFilter: string[];
    framework?: MiniFrameworkElement;
}

type ComponentPropsWithAppState = PropsFromAppState & ComponentProps;
type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const mapStateToProps = (state: AppState, props: AppProps) => ({
    frameworkId: afIdFromRouteSelector(state),
});

const requestOptions: Requests<ComponentPropsWithAppState, Params> = {
    frameworkGetRequest: {
        url: ({ props: { frameworkId } }: { props: Props }) => `/analysis-frameworks/${frameworkId}/`,
        onMount: true,
        method: methods.GET,
        query: {
            fields: ['id', 'questions', 'widgets', 'title'],
        },
        onPropsChanged: ['frameworkId'],
        onSuccess: ({ params, response }) => {
            if (!params || !params.setFramework) {
                return;
            }
            const framework = response as MiniFrameworkElement;
            params.setFramework(framework);
        },
    },

    questionDeleteRequest: {
        url: ({ props: { frameworkId }, params }) => (
            `/analysis-frameworks/${frameworkId}/questions/${params && params.questionId}/`
        ),
        method: methods.DELETE,
        onSuccess: ({ params }) => {
            if (!params || !params.onDeleteSuccess || !params.questionId) {
                return;
            }
            params.onDeleteSuccess(params.questionId);
        },
    },
    questionArchiveRequest: {
        url: ({ props: { frameworkId }, params }) => (
            `/analysis-frameworks/${frameworkId}/questions/${params && params.questionId}/`
        ),
        method: methods.PATCH,
        body: ({ params }) => ({
            isArchived: params && params.archive,
        }),
        onSuccess: ({ params, response }) => {
            if (!params || !params.onArchiveSuccess) {
                return;
            }
            const question = response as FrameworkQuestionElement;
            params.onArchiveSuccess(question);
        },
    },
    bulkQuestionDeleteRequest: {
        url: ({ props: { frameworkId } }) => (
            `/analysis-frameworks/${frameworkId}/questions/bulk-delete/`
        ),
        body: ({ params }) => params && params.body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkDeleteSuccess || !params.body) {
                return;
            }
            params.onBulkDeleteSuccess(response as number[]);
        },
    },
    bulkQuestionArchiveRequest: {
        url: ({ props: { frameworkId } }) => (
            `/analysis-frameworks/${frameworkId}/questions/bulk-archive/`
        ),
        body: ({ params }) => params && params.body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkArchiveSuccess || !params.body) {
                return;
            }
            params.onBulkArchiveSuccess(response as number[], true);
        },
    },
    bulkQuestionUnArchiveRequest: {
        url: ({ props: { frameworkId } }) => (
            `/analysis-frameworks/${frameworkId}/questions/bulk-unarchive/`
        ),
        body: ({ params }) => params && params.body,
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            if (!params || !params.onBulkUnArchiveSuccess || !params.body) {
                return;
            }
            params.onBulkUnArchiveSuccess(response as number[], false);
        },
    },
};

// const questionKeySelector = (d: FrameworkQuestionElement) => d.id;

class FrameworkQuestions extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            showQuestionModal: false,
            questionToEdit: undefined,
            treeFilter: [],
        };
        this.props.requests.frameworkGetRequest.setDefaultParams({
            setFramework: (framework: MiniFrameworkElement) => {
                this.setState({ framework });
            },
        });

        this.views = {
            active: {
                component: QuestionList,
                rendererParams: () => {
                    const {
                        requests: {
                            questionDeleteRequest,
                            questionArchiveRequest,
                            bulkQuestionDeleteRequest,
                            bulkQuestionArchiveRequest,
                            bulkQuestionUnArchiveRequest,
                        },
                    } = this.props;
                    const { framework, treeFilter } = this.state;
                    const filteredQuestions = this.getFilteredQuestions(
                        framework ? framework.questions : undefined,
                        treeFilter,
                    );

                    return ({
                        title: 'Active Questions',
                        className: styles.questionList,
                        onAdd: this.handleAddQuestionButtonClick,
                        onEdit: this.handleEditQuestionButtonClick,
                        onDelete: this.handleDeleteQuestion,
                        onArchive: this.handleArchiveQuestion,
                        onBulkDelete: this.handleBulkDelete,
                        onBulkArchive: this.handleBulkArchive,
                        framework,
                        questions: filteredQuestions,
                        filtered: treeFilter.length > 0,

                        showLoadingOverlay: questionDeleteRequest.pending
                            || questionArchiveRequest.pending
                            || bulkQuestionDeleteRequest.pending
                            || bulkQuestionArchiveRequest.pending
                            || bulkQuestionUnArchiveRequest.pending,
                        archived: false,
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
                            bulkQuestionDeleteRequest,
                            bulkQuestionArchiveRequest,
                            bulkQuestionUnArchiveRequest,
                        },
                    } = this.props;
                    const { framework, treeFilter } = this.state;
                    const filteredQuestions = this.getFilteredQuestions(
                        framework ? framework.questions : undefined,
                        treeFilter,
                    );

                    return ({
                        title: 'Parking Lot Questions',
                        className: styles.questionList,
                        onUnarchive: this.handleUnarchiveQuestion,
                        onBulkUnArchive: this.handleBulkUnArchive,
                        framework,
                        showLoadingOverlay: questionDeleteRequest.pending
                            || questionArchiveRequest.pending
                            || bulkQuestionDeleteRequest.pending
                            || bulkQuestionArchiveRequest.pending
                            || bulkQuestionUnArchiveRequest.pending,
                        questions: filteredQuestions,
                        filtered: treeFilter.length > 0,
                        archived: true,
                    });
                },
            },
        };
    }

    private getFrameworkMatrices = memoize(getFrameworkMatrices)

    private getFilteredQuestions = memoize(getFilteredQuestions)

    private views: {
        active: ViewComponent<React.ComponentProps<typeof QuestionList>>;
        archived: ViewComponent<React.ComponentProps<typeof QuestionList>>;
    }

    private handleQuestionDeleteRequestSuccess = (questionId: FrameworkQuestionElement['id']) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const newFramework = produce(framework, (safeFramework) => {
            const { questions } = safeFramework;
            const selectedIndex = questions.findIndex(e => e.id === questionId);
            if (selectedIndex !== -1) {
                // eslint-disable-next-line no-param-reassign
                safeFramework.questions.splice(selectedIndex, 1);
            }
        });

        this.setState({
            framework: newFramework,
        });
    }

    private handleBulkQuestionDeleteSuccess = (questionIds: FrameworkQuestionElement['id'][]) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const newFramework = produce(framework, (safeFramework) => {
            const { questions } = safeFramework;

            questionIds.forEach((questionId: number) => {
                const selectedIndex = questions.findIndex(e => e.id === questionId);
                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeFramework.questions.splice(selectedIndex, 1);
                }
            });
        });

        this.setState({
            framework: newFramework,
        });
    }

    private handleBulkArchiveSuccess = (questionIds: FrameworkQuestionElement['id'][], archiveStatus: boolean) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const newFramework = produce(framework, (safeFramework) => {
            const { questions } = safeFramework;

            questionIds.forEach((questionId: number) => {
                const selectedIndex = questions.findIndex(e => e.id === questionId);
                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeFramework.questions[selectedIndex].isArchived = archiveStatus;
                }
            });
        });

        this.setState({
            framework: newFramework,
        });
    }

    private handleQuestionArchiveRequestSuccess = (question: FrameworkQuestionElement) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const newFramework = produce(framework, (safeFramework) => {
            const { questions } = safeFramework;
            const selectedIndex = questions.findIndex(e => e.id === question.id);
            if (selectedIndex !== -1) {
                // eslint-disable-next-line no-param-reassign
                safeFramework.questions[selectedIndex] = question;
            }
        });

        this.setState({
            framework: newFramework,
        });
    }

    private handleDeleteQuestion = (questionId: FrameworkQuestionElement['id']) => {
        this.props.requests.questionDeleteRequest.do({
            questionId,
            onDeleteSuccess: this.handleQuestionDeleteRequestSuccess,
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

    private handleArchiveQuestion = (questionId: FrameworkQuestionElement['id']) => {
        this.props.requests.questionArchiveRequest.do({
            questionId,
            archive: true,
            onArchiveSuccess: this.handleQuestionArchiveRequestSuccess,
        });
    }

    private handleUnarchiveQuestion = (questionId: FrameworkQuestionElement['id']) => {
        this.props.requests.questionArchiveRequest.do({
            questionId,
            archive: false,
            onArchiveSuccess: this.handleQuestionArchiveRequestSuccess,
        });
    }

    private handleEditQuestionButtonClick = (questionKey: FrameworkQuestionElement['id']) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const question = framework.questions.find(d => d.id === questionKey);
        this.setState({
            showQuestionModal: true,
            questionToEdit: question,
        });
    }

    private handleAddQuestionButtonClick = () => {
        this.setState({
            showQuestionModal: true,
            questionToEdit: undefined,
        });
    }

    private handleAddQuestionModalCloseButtonClick = () => {
        this.setState({
            showQuestionModal: false,
            questionToEdit: undefined,
        });
    }

    private handleQuestionFormRequestSuccess = (question: FrameworkQuestionElement) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const { id: questionId } = question;

        const newFramework = produce(framework, (safeFramework) => {
            const { questions } = safeFramework;
            const selectedIndex = questions.findIndex(e => e.id === questionId);
            if (selectedIndex === -1) {
                safeFramework.questions.push(question);
            } else {
                // eslint-disable-next-line no-param-reassign
                safeFramework.questions[selectedIndex] = question;
            }
        });

        this.setState({
            framework: newFramework,
            showQuestionModal: false,
            questionToEdit: undefined,
        });
    }

    private handleTreeInputChange = (value: string[]) => {
        this.setState({ treeFilter: value });
    }

    private tabsModifier = (itemKey: TabElement) => {
        const { framework } = this.state;

        const totalCount = framework
            ? framework.questions.length
            : 0;
        const activeCount = framework
            ? framework.questions.filter(question => !question.isArchived).length
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
                frameworkGetRequest: {
                    pending: frameworkGetPending,
                },
            },
        } = this.props;

        const {
            showQuestionModal,
            questionToEdit,
            framework,
            treeFilter,
        } = this.state;

        if (frameworkGetPending) {
            return (
                <div
                    className={_cs(styles.frameworkQuestions, className)}
                >
                    <LoadingAnimation />
                </div>
            );
        }

        if (!framework) {
            return (
                <div
                    className={_cs(styles.frameworkQuestions, className)}
                >
                    <Message>
                        {/* FIXME: use strings */}
                        Could not get framework!
                    </Message>
                </div>
            );
        }

        return (
            <>
                <Page
                    headerAboveSidebar
                    className={_cs(className, styles.frameworkQuestions)}
                    headerClassName={styles.header}
                    header={(
                        <>
                            <BackLink
                                className={styles.backLink}
                                defaultLink={reverseRoute(pathNames.homeScreen, {})}
                            />
                            <h2 className={styles.heading}>
                                {framework
                                    ? `${framework.title} › Questions`
                                    : 'Framework > Questions'}
                            </h2>
                        </>
                    )}
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
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
                            <header className={styles.header}>
                                <h3>
                                    Filter
                                </h3>
                                <h4>
                                    Matrices
                                </h4>
                                <TreeInput
                                    keySelector={treeItemKeySelector}
                                    parentKeySelector={treeItemParentKeySelector}
                                    labelSelector={treeItemLabelSelector}
                                    onChange={this.handleTreeInputChange}
                                    value={treeFilter}
                                    options={this.getFrameworkMatrices(framework)}
                                    defaultCollapseLevel={0}
                                />
                            </header>
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <>
                            <MultiViewContainer
                                views={this.views}
                                useHash
                            />
                        </>
                    )}
                />
                {showQuestionModal && (
                    <QuestionModalForFramework
                        value={questionToEdit}
                        framework={framework}
                        onRequestSuccess={this.handleQuestionFormRequestSuccess}
                        closeModal={this.handleAddQuestionModalCloseButtonClick}
                    />
                )}
            </>
        );
    }
}

export default connect(mapStateToProps)(
    RequestCoordinator(
        RequestClient(requestOptions)(
            FrameworkQuestions,
        ),
    ),
);
