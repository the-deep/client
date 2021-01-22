import React from 'react';
import { connect } from 'react-redux';
import { produce } from 'immer';
import memoize from 'memoize-one';
import {
    _cs,
    compareNumber,
    reverseRoute,
} from '@togglecorp/fujs';

import MultiViewContainer from '#rscv/MultiViewContainer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import SearchInput from '#rsci/SearchInput';
import Page from '#rscv/Page';
import VerticalTabs from '#rscv/VerticalTabs';
import TreeInput from '#rsu/../v2/Input/TreeInput';
import { getArrayMoveDetails } from '#utils/common';

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
    BulkActionId,
    OrderAction,
    NullableField,
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

import QuestionList, { QuestionListProps } from '#qbc/QuestionList';
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
    orderAction?: OrderAction;
    onBulkDeleteSuccess?: (questionIds: FrameworkQuestionElement['id'][]) => void;
    onBulkArchiveSuccess?: (questionIds: FrameworkQuestionElement['id'][], archiveStatus: boolean) => void;
    onBulkUnArchiveSuccess?: (questionIds: FrameworkQuestionElement['id'][], archiveStatus: boolean) => void;

    archive?: boolean;
    onArchiveSuccess?: (question: FrameworkQuestionElement) => void;
    onCloneSuccess?: (question: FrameworkQuestionElement) => void;
}

interface State {
    showQuestionModal: boolean;
    questionToEdit: NullableField<FrameworkQuestionElement, 'id' | 'order'> | undefined;
    treeFilter: string[];
    // NOTE: this is the id after which to insert new item
    newQuestionOrder?: number;
    framework?: MiniFrameworkElement;
    searchValue: string;
}

type ComponentPropsWithAppState = PropsFromAppState & ComponentProps;
type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const mapStateToProps = (state: AppState) => ({
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
    orderChangeRequest: {
        url: ({ props: { frameworkId }, params }) => (
            `/analysis-frameworks/${frameworkId}/questions/${params && params.questionId}/order/`
        ),
        method: methods.POST,
        body: ({ params }) => params && params.orderAction,
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

const questionKeySelector = (d: FrameworkQuestionElement) => d.id;

class FrameworkQuestions extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            showQuestionModal: false,
            questionToEdit: undefined,
            treeFilter: [],
            searchValue: '',
        };
        this.props.requests.frameworkGetRequest.setDefaultParams({
            setFramework: (framework: MiniFrameworkElement) => {
                this.setState({
                    framework: {
                        ...framework,
                        questions: [...framework.questions].sort(
                            (a, b) => compareNumber(a.order, b.order),
                        ),
                    },
                });
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
                    const {
                        framework,
                        treeFilter,
                        searchValue,
                    } = this.state;

                    const filteredQuestions = this.getFilteredQuestions(
                        framework ? framework.questions : undefined,
                        treeFilter,
                    );

                    return ({
                        title: 'Active Questions',
                        className: styles.questionList,
                        onAdd: this.handleAddQuestionButtonClick,
                        onEdit: this.handleEditQuestionButtonClick,
                        onAddButtonClick: this.handleAddNewQuestionButtonClick,
                        onOrderChange: this.handleOrderChange,
                        onClone: this.handleCloneQuestion,
                        onDelete: this.handleDeleteQuestion,
                        onArchive: this.handleArchiveQuestion,
                        onBulkDelete: this.handleBulkDelete,
                        onBulkArchive: this.handleBulkArchive,
                        framework,
                        searchValue,
                        questions: filteredQuestions,
                        isFiltered: treeFilter.length > 0 || !!searchValue,
                        questionClassName: styles.question,

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
                    const {
                        framework,
                        treeFilter,
                        searchValue,
                    } = this.state;

                    const filteredQuestions = this.getFilteredQuestions(
                        framework ? framework.questions : undefined,
                        treeFilter,
                    );

                    return ({
                        title: 'Parking Lot Questions',
                        className: styles.questionList,
                        onUnarchive: this.handleUnarchiveQuestion,
                        onBulkUnArchive: this.handleBulkUnArchive,
                        searchValue,
                        framework,
                        showLoadingOverlay: questionDeleteRequest.pending
                            || questionArchiveRequest.pending
                            || bulkQuestionDeleteRequest.pending
                            || bulkQuestionArchiveRequest.pending
                            || bulkQuestionUnArchiveRequest.pending,
                        questions: filteredQuestions,
                        questionClassName: styles.question,
                        isFiltered: treeFilter.length > 0,
                        archived: true,
                    });
                },
            },
        };
    }

    private getFrameworkMatrices = memoize(getFrameworkMatrices)

    private getFilteredQuestions = memoize((
        questions: FrameworkQuestionElement[] | undefined,
        frameworkAttributes?: string[],
        // searchValue?: string,
        // archived?: boolean
    ) => (
        getFilteredQuestions(questions, frameworkAttributes)
    ))

    private views: {
        active: ViewComponent<QuestionListProps<FrameworkQuestionElement>>;
        archived: ViewComponent<QuestionListProps<FrameworkQuestionElement>>;
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

    private handleOrderChange = (questions: FrameworkQuestionElement[]) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const newFramework = produce(framework, (safeFramework) => {
            // eslint-disable-next-line no-param-reassign
            safeFramework.questions = questions;
        });

        const { questions: oldQuestions } = framework;
        const { questions: newQuestions } = newFramework;

        const arrayMoveData = getArrayMoveDetails(oldQuestions, newQuestions, questionKeySelector);

        const movedQuestion = arrayMoveData.movedData;

        if (!movedQuestion) {
            return;
        }
        const orderAction = {
            action: (arrayMoveData.top ? 'top' : 'below') as OrderAction['action'],
            value: arrayMoveData.afterData,
        };

        this.setState({
            framework: newFramework,
        }, () => {
            this.props.requests.orderChangeRequest.do({
                questionId: movedQuestion,
                orderAction,
            });
        });
    }

    private handleCloneQuestion = (question: FrameworkQuestionElement) => {
        this.setState({
            showQuestionModal: true,
            questionToEdit: {
                ...question,
                id: undefined,
                order: undefined,
            },
            newQuestionOrder: undefined,
        });
    }

    private handleAddNewQuestionButtonClick = (newQuestionOrder: number) => {
        const { framework } = this.state;

        if (!framework) {
            return;
        }

        this.setState({
            showQuestionModal: true,
            questionToEdit: undefined,
            newQuestionOrder,
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
            newQuestionOrder: undefined,
        });
    }

    private handleAddQuestionButtonClick = () => {
        this.setState({
            showQuestionModal: true,
            questionToEdit: undefined,
            newQuestionOrder: undefined,
        });
    }

    private handleAddQuestionModalCloseButtonClick = () => {
        this.setState({
            showQuestionModal: false,
            questionToEdit: undefined,
            newQuestionOrder: undefined,
        });
    }

    private handleQuestionFormRequestSuccess = (question: FrameworkQuestionElement) => {
        const { framework } = this.state;
        if (!framework) {
            return;
        }

        const { id: questionId, order } = question;

        const newFramework = produce(framework, (safeFramework) => {
            const { questions } = safeFramework;
            const selectedIndex = questions.findIndex(e => e.id === questionId);
            if (selectedIndex === -1) {
                safeFramework.questions.splice(order - 1, 0, question);
            } else {
                // eslint-disable-next-line no-param-reassign
                safeFramework.questions[selectedIndex] = question;
            }
        });

        this.setState({
            framework: newFramework,
            showQuestionModal: false,
            questionToEdit: undefined,
            newQuestionOrder: undefined,
        });
    }

    private handleSearchValueChange = (searchValue: string) => {
        this.setState({ searchValue });
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
            newQuestionOrder,
            searchValue,
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
                                defaultLink={reverseRoute(pathNames.landingPage, {})}
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
                                    <h3 className={styles.heading}>
                                        Question Status
                                    </h3>
                                </header>
                                <VerticalTabs
                                    tabs={tabs}
                                    useHash
                                    replaceHistory
                                    modifier={this.tabsModifier}
                                />
                            </div>
                            <div className={styles.filter}>
                                <h3> Filter </h3>
                                <SearchInput
                                    value={searchValue}
                                    className={styles.searchInput}
                                    onChange={this.handleSearchValueChange}
                                    placeholder="Search questions"
                                    showLabel={false}
                                    showHintAndError={false}
                                />
                                <TreeInput
                                    label="Matrices"
                                    keySelector={treeItemKeySelector}
                                    parentKeySelector={treeItemParentKeySelector}
                                    labelSelector={treeItemLabelSelector}
                                    onChange={this.handleTreeInputChange}
                                    value={treeFilter}
                                    options={
                                        this.getFrameworkMatrices(framework, framework.questions)
                                    }
                                    defaultCollapseLevel={0}
                                />
                            </div>
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <MultiViewContainer
                            views={this.views}
                            useHash
                        />
                    )}
                />
                {showQuestionModal && (
                    <QuestionModalForFramework
                        value={questionToEdit}
                        framework={framework}
                        newQuestionOrder={newQuestionOrder}
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
