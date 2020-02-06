import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { produce } from 'immer';
import {
    _cs,
    reverseRoute,
    isDefined,
    sum,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ListView from '#rsu/../v2/View/ListView';
import ProgressBar from '#rsu/../v2/View/ProgressBar';
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

import MetaOutput from '#qbc/MetaOutput';
import Question from '#qbc/Question';
import QuestionModalForQuestionnaire from '#qbc/QuestionModalForQuestionnaire';

import styles from './styles.scss';

interface FrameworkQuestionProps {
    onCopyButtonClick?: (id: BaseQuestionElement['id']) => void;
    onEditButtonClick?: (id: BaseQuestionElement['id']) => void;
    className?: string;
    data: BaseQuestionElement;
    framework: MiniFrameworkElement;
}

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

const questionKeySelector = (q: BaseQuestionElement) => q.id;

const FrameworkQuestion = (p: FrameworkQuestionProps) => {
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

    private getQuestionRendererParams = (key: QuestionnaireQuestionElement['id'], question: QuestionnaireQuestionElement) => {
        const { framework } = this.state;

        return {
            data: question,
            onEditButtonClick: this.handleEditQuestionButtonClick,
            framework: framework as MiniFrameworkElement,
            className: styles.question,
        };
    }

    private getFrameworkQuestionRendererParams = (
        key: FrameworkQuestionElement['id'],
        question: FrameworkQuestionElement,
    ) => {
        const { framework } = this.state;

        return {
            data: question,
            framework: framework as MiniFrameworkElement,
            className: styles.frameworkQuestion,
            hideDetails: true,
            readOnly: true,
        };
    }

    private getFrameworkMatrices = memoize(getFrameworkMatrices)

    private getFilteredQuestions = memoize(getFilteredQuestions)

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

    private handleQuestionFormRequestSuccess = (question: QuestionnaireQuestionElement) => {
        const { questionnaire } = this.state;
        const { id: questionId } = question;

        const newQuestionnaire = produce(questionnaire,
            (safeQuestionnaire: QuestionnaireElement) => {
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
            treeFilter,
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
            id: questionnaireId,
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
                            {framework && (
                                <div className={styles.content}>
                                    <h3>
                                        Add from Framework
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
                                    <h4>
                                        Questions
                                    </h4>
                                    <ListView
                                        className={styles.frameworkQuestionList}
                                        rendererParams={this.getFrameworkQuestionRendererParams}
                                        renderer={FrameworkQuestion}
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
                            )}
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
                                    <ProgressBar progress={percent} />
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
