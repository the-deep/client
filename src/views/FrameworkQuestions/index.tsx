import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import ListView from '#rsu/../v2/View/ListView';
import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
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

    Requests,
    AddRequestProps,
    AppState,
    AppProps,
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
import Question from '#qbc/Question';
import QuestionModalForFramework from '#qbc/QuestionModalForFramework';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
}

interface PropsFromAppState {
    frameworkId: MiniFrameworkElement['id'];
}

interface Params {
    setFramework?: (framework: MiniFrameworkElement) => void;
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
};

const questionKeySelector = (d: FrameworkQuestionElement) => d.id;

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
    }

    private getQuestionRendererParams = (key: FrameworkQuestionElement['id'], question: FrameworkQuestionElement) => {
        const { framework } = this.state;

        return {
            data: question,
            framework,
            className: styles.question,
            onEditButtonClick: this.handleEditQuestionButtonClick,
        };
    }

    private getFrameworkMatrices = memoize(getFrameworkMatrices)

    private getFilteredQuestions = memoize(getFilteredQuestions)

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

    private handleQuestionFormRequestSuccess = () => {
        this.setState({
            showQuestionModal: false,
            questionToEdit: undefined,
        });

        const { requests } = this.props;
        requests.frameworkGetRequest.do();
    }

    private handleTreeInputChange = (value: string[]) => {
        this.setState({ treeFilter: value });
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
                            <div className={_cs(styles.questionList, className)}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        {/* FIXME: use strings */}
                                        Questions
                                    </h3>
                                    <div className={styles.actions}>
                                        <Button
                                            className={styles.addQuestionButton}
                                            onClick={this.handleAddQuestionButtonClick}
                                        >
                                            {/* FIXME: use strings */}
                                            Add question
                                        </Button>
                                    </div>
                                </header>
                                <ListView
                                    className={styles.content}
                                    data={
                                        this.getFilteredQuestions(
                                            framework.questions,
                                            treeFilter,
                                        )
                                    }
                                    keySelector={questionKeySelector}
                                    renderer={Question}
                                    rendererParams={this.getQuestionRendererParams}
                                    filtered={treeFilter.length > 0}
                                />
                                {showQuestionModal && (
                                    <QuestionModalForFramework
                                        value={questionToEdit}
                                        framework={framework}
                                        onRequestSuccess={this.handleQuestionFormRequestSuccess}
                                        closeModal={this.handleAddQuestionModalCloseButtonClick}
                                    />
                                )}
                            </div>
                        </>
                    )}
                />
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
