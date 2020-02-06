import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
    isDefined,
    sum,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ListView from '#rscv/List/ListView';
import ProgressBar from '#rsu/../v2/View/ProgressBar';

import Page from '#rscv/Page';

import {
    QuestionnaireElement,
    QuestionnaireQuestionElement,
    MiniFrameworkElement,
    ProjectElement,

    AppState,
    Requests,
    AddRequestProps,
} from '#typings';

import {
    methods,
    RequestCoordinator,
    RequestClient,
} from '#request';

import {
    questionnaireIdFromRouteSelector,
    projectIdFromRouteSelector,
    projectDetailsSelector,
} from '#redux';

import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import MetaOutput from '#qbc/MetaOutput';
import Question from '#qbc/Question';
import QuestionModalForQuestionnaire from '#qbc/QuestionModalForQuestionnaire';

import styles from './styles.scss';

/*
interface FrameworkQuestionElement {
    onCopyButtonClick?: (id: QuestionnaireQuestionElement['id']) => void;
    onEditButtonClick?: (id: QuestionnaireQuestionElement['id']) => void;
    className?: string;
    data: QuestionnaireQuestionElement;
    framework: MiniFrameworkElement;
}
*/

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

interface Params {
    setQuestionnaire?: (questionnaire: QuestionnaireElement) => void;
    setFramework?: (framework: MiniFrameworkElement) => void;
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
};

type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const questionKeySelector = (q: QuestionnaireQuestionElement) => q.id;

/*
const FrameworkQuestion = (p: FrameworkQuestionElement) => {
    const {
        onCopyButtonClick,
        className,
        ...otherProps
    } = p;

    return (
        <div className={_cs(className, styles.frameworkQuestion)}>
            <Question {...otherProps} />
            <div className={styles.actions}>
                <AccentButton
                    iconName="copyOutline"
                    onClick={onCopyButtonClick}
                    disabled
                    // FIXME: use strings
                >
                    Copy
                </AccentButton>
            </div>
        </div>
    );
};
*/

class QuestionnaireBuilder extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            showQuestionFormModal: false,
            questionToEdit: undefined,
            questionnaire: undefined,
            framework: undefined,
        };
        this.props.requests.questionnaireGetRequest.setDefaultParams({
            setQuestionnaire: (questionnaire: QuestionnaireElement) => {
                this.setState({ questionnaire });
            },
        });
        this.props.requests.frameworkGetRequest.setDefaultParams({
            setFramework: (framework: MiniFrameworkElement) => {
                this.setState({ framework });
            },
        });
    }

    private getQuestionRendererParams = (key: QuestionnaireQuestionElement['id'], question: QuestionnaireQuestionElement) => {
        const { framework } = this.state;
        return {
            data: question,
            onEditButtonClick: this.handleEditQuestionButtonClick,
            framework: framework as MiniFrameworkElement,
            className: styles.question,
        };
    }

    /*
    private getFrameworkQuestionRendererParams = (
        key: QuestionnaireQuestionElement['id'],
        question: QuestionnaireQuestionElement,
    ) => {
        const { questionnaire } = this.state;

        return {
            data: question,
            framework: questionnaire ? questionnaire.projectFrameworkDetail : undefined,
            className: styles.frameworkQuestion,
            hideDetails: true,
            readOnly: true,
        };
    }
    */

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

    private handleCloseQuestionFormModalButtonClick = () => {
        this.setState({
            showQuestionFormModal: false,
            questionToEdit: undefined,
        });
    }

    private handleQuestionFormRequestSuccess = () => {
        this.setState({
            showQuestionFormModal: false,
            questionToEdit: undefined,
        });

        const { requests } = this.props;
        requests.questionnaireGetRequest.do();
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
            },
            projectDetail,
        } = this.props;

        const {
            showQuestionFormModal,
            questionToEdit,
            questionnaire,
            framework,
        } = this.state;

        if (questionnaireGetPending || frameworkGetPending) {
            return (
                <div
                    className={_cs(styles.questionnaireBuilder, className)}
                >
                    <LoadingAnimation />
                </div>
            );
        }

        if (!questionnaire) {
            return (
                <div
                    className={_cs(styles.questionnaireBuilder, className)}
                >
                    <Message>
                        {/* FIXME: use strings */}
                        Could not get questionnaire!
                    </Message>
                </div>
            );
        }

        const {
            title,
            questions,
            crisisTypeDetail,
            dataCollectionTechniqueDisplay,
            enumeratorSkillDisplay,
            requiredDuration,
        } = questionnaire;

        const selectedQuestions = questions.filter(question => !question.isArchived);

        const totalQuestions = selectedQuestions.length;

        const totalTimeRequired = sum(
            selectedQuestions
                .map(question => question.requiredDuration)
                .filter(isDefined),
        );
        const percent = Math.round(100 * (totalTimeRequired / requiredDuration));

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
                                <h3 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Project
                                </h3>
                                <div className={styles.value}>
                                    { projectDetail.title || '-'}
                                </div>
                                <h3 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Analysis Framework
                                </h3>
                                <div className={styles.value}>
                                    { framework ? framework.title : '-' }
                                </div>
                            </div>
                            {/* questionnaire.projectFrameworkDetail && (
                                <div className={styles.content}>
                                    <h4>
                                        Matrix 2D
                                    </h4>
                                    <TreeSelection
                                        value={createReportStructure(
                                            questionnaire.projectFrameworkDetail,
                                        )}
                                    />
                                    <h4>
                                        Questions from Framework
                                    </h4>
                                    <ListView
                                        className={styles.frameworkQuestionList}
                                        rendererParams={this.getFrameworkQuestionRendererParams}
                                        renderer={FrameworkQuestion}
                                        data={questionnaire.projectFrameworkDetail.questions}
                                        keySelector={questionKeySelector}
                                    />
                                </div>
                            ) */}
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <>
                            <div className={styles.questionList}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        {/* FIXME: use strings */}
                                        Questions
                                    </h3>
                                    <div className={styles.actions}>
                                        <Button onClick={this.handleAddQuestionButtonClick}>
                                            {/* FIXME: use strings */}
                                            Add question
                                        </Button>
                                    </div>
                                </header>
                                <ListView
                                    className={styles.content}
                                    rendererParams={this.getQuestionRendererParams}
                                    renderer={Question}
                                    data={questions}
                                    keySelector={questionKeySelector}
                                />
                            </div>
                            <div className={styles.rightPanel}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        {title}
                                    </h3>
                                </header>
                                <div className={styles.content}>
                                    <div>
                                        <MetaOutput
                                            // FIXME: use strings
                                            label="Crisis type"
                                            value={
                                                crisisTypeDetail
                                                    ? crisisTypeDetail.title
                                                    : undefined
                                            }
                                        />
                                        <MetaOutput
                                            // FIXME: use strings
                                            label="Data collection technique"
                                            value={dataCollectionTechniqueDisplay}
                                        />
                                        <MetaOutput
                                            // FIXME: use strings
                                            label="Enumerator skill"
                                            value={enumeratorSkillDisplay}
                                        />
                                        <MetaOutput
                                            // FIXME: use strings
                                            label="Required duration"
                                            value={
                                                requiredDuration
                                                    ? `${requiredDuration} min`
                                                    : undefined
                                            }
                                        />
                                    </div>
                                    {/* FIXME: use strings */}
                                    <h4>
                                        Questions
                                    </h4>
                                    <div>
                                        <div>Selected</div>
                                        <div>{totalQuestions}</div>
                                        <div>Time Required</div>
                                        <div>{`${totalTimeRequired} min`}</div>
                                    </div>
                                    <h4>
                                        Questionnaire
                                    </h4>
                                    <div>
                                        <div>Theoretic Time</div>
                                        <div>{`${requiredDuration} min`}</div>
                                    </div>
                                    <ProgressBar
                                        progress={percent}
                                    />
                                    <div>
                                        {`Your questionnaire is currently using ${percent}% of the time you determined`}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                />
                {showQuestionFormModal && (
                    <QuestionModalForQuestionnaire
                        value={questionToEdit}
                        questionnaire={questionnaire}
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
