import React from 'react';
import { connect } from 'react-redux';

import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import ListView from '#rscv/List/ListView';
import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    methods,
    RequestCoordinator,
    RequestClient,
    getResponse,
    getPending,
} from '#request';
import { pathNames } from '#constants';
import {
    FrameworkQuestionElement,
    FrameworkElement,

    Requests,
    AddRequestProps,
    AppState,
    AppProps,
} from '#typings';
import { afIdFromRouteSelector } from '#redux';
import BackLink from '#components/general/BackLink';
import Question from '#qbc/Question';
import QuestionModalForFramework from '#qbc/QuestionModalForFramework';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
}

interface PropsFromAppState {
    frameworkId: FrameworkElement['id'];
}

interface Params {
}

interface State {
    showQuestionModal: boolean;
    questionToEdit: FrameworkQuestionElement | undefined;
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
    },
};

const questionKeySelector = (d: FrameworkQuestionElement) => d.id;

class FrameworkQuestions extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            showQuestionModal: false,
            questionToEdit: undefined,
        };
    }

    private getQuestionRendererParams = (key: FrameworkQuestionElement['id'], question: FrameworkQuestionElement) => {
        const { requests } = this.props;
        const framework = getResponse(requests, 'frameworkGetRequest') as FrameworkElement;

        return {
            data: question,
            framework,
            className: styles.question,
            onEditButtonClick: this.handleEditQuestionButtonClick,
        };
    }

    private handleEditQuestionButtonClick = (questionKey: FrameworkQuestionElement['id']) => {
        const { requests } = this.props;
        const framework = getResponse(requests, 'frameworkGetRequest') as FrameworkElement;

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

    public render() {
        const {
            className,
            requests,
        } = this.props;

        const framework = getResponse(requests, 'frameworkGetRequest') as FrameworkElement;
        const pending = getPending(requests, 'frameworkGetRequest');

        const {
            showQuestionModal,
            questionToEdit,
        } = this.state;

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
                                {/* FIXME: use strings */}
                                Framework questions
                            </h2>
                        </>
                    )}
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <header className={styles.header}>
                                <h3 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Analysis framework
                                </h3>
                            </header>
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <>
                            { pending && <LoadingAnimation /> }
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
                                    data={framework.questions}
                                    keySelector={questionKeySelector}
                                    renderer={Question}
                                    rendererParams={this.getQuestionRendererParams}
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
                            <div className={styles.rightPanel}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        {/* FIXME: use strings */}
                                        This space is intentionally left blank
                                    </h3>
                                </header>
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
