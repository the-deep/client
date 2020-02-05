import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
// import AccentButton from '#rsca/Button/AccentButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ListView from '#rscv/List/ListView';
import modalize from '#rscg/Modalize';
// import TreeSelection from '#rsci/TreeSelection';

import Page from '#rscv/Page';

import {
    QuestionnaireElement,
    QuestionnaireQuestionElement,
    FrameworkElement,
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

// import { createReportStructure } from '#utils/framework';
import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import Question from '#qbc/Question';
import QuestionnaireModal from '#qbc/QuestionnaireModal';
import QuestionModalForQuestionnaire from '#qbc/QuestionModalForQuestionnaire';

import styles from './styles.scss';

const ModalButton = modalize(Button);

interface FrameworkQuestionElement {
    onCopyButtonClick?: (id: QuestionnaireQuestionElement['id']) => void;
    onEditButtonClick?: (id: QuestionnaireQuestionElement['id']) => void;
    className?: string;
    data: QuestionnaireQuestionElement;
    framework: FrameworkElement;
}

interface ComponentProps {
    className?: string;
    projectDetail: ProjectElement;
}

interface State {
    showQuestionFormModal: boolean;
    questionToEdit?: QuestionnaireQuestionElement;
    questionnaire?: QuestionnaireElement;
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
    setQuestionnaire: (questionnaire: QuestionnaireElement) => void;
}

const requestOptions: Requests<ComponentPropsWithAppState, Params> = {
    questionnaireGetRequest: {
        url: ({ props: { questionnaireId } }) => `/questionnaires/${questionnaireId}/`,
        onMount: true,
        method: methods.GET,
        onSuccess: ({ params, response }) => {
            if (!params || !params.setQuestionnaire) {
                return;
            }
            const questionnaire = response as QuestionnaireElement;
            params.setQuestionnaire(questionnaire);
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
        };
        this.props.requests.questionnaireGetRequest.setDefaultParams({
            setQuestionnaire: (questionnaire: QuestionnaireElement) => {
                this.setState({ questionnaire });
            },
        });
    }

    private getQuestionRendererParams = (key: QuestionnaireQuestionElement['id'], question: QuestionnaireQuestionElement) => {
        const { questionnaire } = this.state;
        return {
            data: question,
            onEditButtonClick: this.handleEditQuestionButtonClick,
            // framework: (questionnaire as QuestionnaireElement).projectFrameworkDetail,
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

    private handleQuestionnaireFormRequestSuccess = () => {
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
            },
            projectId,
            projectDetail,
        } = this.props;

        const {
            showQuestionFormModal,
            questionToEdit,
            questionnaire,
        } = this.state;

        if (questionnaireGetPending) {
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
                        Could not get questionnnaire
                    </Message>
                </div>
            );
        }

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
                                {questionnaire.title}
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
                                    {/* questionnaire.projectFrameworkDetail
                                        ? questionnaire.projectFrameworkDetail.title
                                        : '-' */}
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
                                        <ModalButton
                                            modal={(
                                                <QuestionnaireModal
                                                    value={questionnaire}
                                                    projectId={projectId}
                                                    onRequestSuccess={
                                                        this.handleQuestionnaireFormRequestSuccess
                                                    }
                                                />
                                            )}
                                        >
                                            {/* FIXME: use strings */}
                                            Edit details
                                        </ModalButton>
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
                                    data={questionnaire.questions}
                                    keySelector={questionKeySelector}
                                />
                            </div>
                            <div className={styles.rightPanel}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        {/* FIXME: use strings */}
                                        Diagnostics
                                    </h3>
                                </header>
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
