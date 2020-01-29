import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import modalize from '#rscg/Modalize';
import TreeSelection from '#rsci/TreeSelection';

import Page from '#rscv/Page';

import {
    AppState,
    // AppProps,
    QuestionnaireElement,
    QuestionElement,
    Requests,
    AddRequestProps,
    FrameworkElement,
} from '#typings';

import {
    methods,
    RequestCoordinator,
    RequestClient,
    getResponse,
    isAnyRequestPending,
} from '#request';

import {
    questionnaireIdFromRouteSelector,
    projectIdFromRouteSelector,
} from '#redux';

import { createReportStructure } from '#utils/framework';
import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import Question from '#qbc/Question';
import QuestionnaireModal from '#qbc/QuestionnaireModal';
import QuestionModalForQuestionnaire from '#qbc/QuestionModalForQuestionnaire';

import styles from './styles.scss';

const ModalButton = modalize(Button);

interface ComponentProps {
    className?: string;
}

interface State {
    showQuestionFormModal: boolean;
    questionToEdit?: QuestionElement;
}

interface PropsFromAppState {
    questionnaireId: QuestionnaireElement['id'];
    projectId: number;
}

type ComponentPropsWithAppState = PropsFromAppState & ComponentProps;


interface Params {
}
type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const mapStateToProps = (state: AppState) => ({
    questionnaireId: questionnaireIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

const requestOptions: Requests<ComponentPropsWithAppState, Params> = {
    questionnaireGetRequest: {
        url: ({ props: { questionnaireId } }) => `/questionnaires/${questionnaireId}/`,
        onMount: true,
        method: methods.GET,
    },
    questionnairePatchRequest: {
        url: ({ props: { questionnaireId } }) => `/questionnaires/${questionnaireId}/`,
        method: methods.PATCH,
    },
};

const questionKeySelector = (q: QuestionElement) => q.id;

interface FrameworkQuestionElement {
    onCopyButtonClick?: (id: QuestionElement['id']) => void;
    onEditButtonClick?: (id: QuestionElement['id']) => void;
    className?: string;
    data: QuestionElement;
    framework: FrameworkElement;
}

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
                >
                    {/* FIXME: use strings */}
                    Copy
                </AccentButton>
            </div>
        </div>
    );
};

class QuestionnaireBuilder extends React.PureComponent<Props, State> {
    public state = {
        showQuestionFormModal: false,
        questionToEdit: undefined,
    };

    private getQuestionRendererParams = (key: QuestionElement['id'], question: QuestionElement) => {
        const { requests } = this.props;
        const questionnaire = getResponse(requests, 'questionnaireGetRequest') as QuestionnaireElement;

        return {
            data: question,
            onEditButtonClick: this.handleEditQuestionButtonClick,
            framework: questionnaire.projectFrameworkDetail,
            className: styles.question,
        };
    }

    private getFrameworkQuestionRendererParams = (key: QuestionElement['id'], question: QuestionElement) => {
        const { requests } = this.props;
        const questionnaire = getResponse(requests, 'questionnaireGetRequest') as QuestionnaireElement;

        return {
            data: question,
            // onEditButtonClick: this.handleEditQuestionButtonClick,
            framework: questionnaire.projectFrameworkDetail,
            className: styles.frameworkQuestion,
            hideDetails: true,
            readOnly: true,
        };
    }

    private handleAddQuestionButtonClick = () => {
        this.setState({
            showQuestionFormModal: true,
            questionToEdit: undefined,
        });
    }

    private handleEditQuestionButtonClick = (questionId: QuestionElement['id']) => {
        const { requests } = this.props;
        const questionnaire = getResponse(requests, 'questionnaireGetRequest') as QuestionnaireElement;

        const questionToEdit = questionnaire.questions.find(q => q.id === questionId);

        if (questionToEdit) {
            this.setState({
                showQuestionFormModal: true,
                questionToEdit,
            });
        }
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
            requests,
            projectId,
        } = this.props;

        const {
            showQuestionFormModal,
            questionToEdit,
        } = this.state;

        const questionnaire = getResponse(requests, 'questionnaireGetRequest') as QuestionnaireElement;
        const pending = isAnyRequestPending(requests);

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
                            <header className={styles.header}>
                                <h3 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Analysis framework
                                </h3>
                            </header>
                            <div className={styles.content}>
                                {questionnaire.projectFrameworkDetail && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <>
                            { pending && <LoadingAnimation /> }
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
