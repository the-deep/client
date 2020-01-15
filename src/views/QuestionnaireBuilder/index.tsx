import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import ListView from '#rscv/List/ListView';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import TreeSelection from '#rsci/TreeSelection';

import Page from '#rscv/Page';

import {
    AppState,
    AppProps,
    QuestionnaireElement,
    QuestionElement,
    Requests,
    AddRequestProps,
} from '#typings';

import {
    methods,
    RequestCoordinator,
    RequestClient,
    getResponse,
} from '#request';

import { questionnaireIdFromRouteSelector } from '#redux';

import { createReportStructure } from '#utils/framework';
import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';
import QuestionnaireForm from '#qbc/QuestionnaireForm';
import Question from '#qbc/Question';

import QuestionnaireQuestionForm from './QuestionnaireQuestionForm';

import styles from './styles.scss';

interface PropsFromAppState {
    questionnaireId: QuestionnaireElement['id'];
}

interface ComponentProps {
    className?: string;
}

interface Params {
}

interface State {
    showQuestionFormModal: boolean;
    showEditDetailFormModal: boolean;
    questionToEdit?: QuestionElement;
}

type ComponentPropsWithAppState = PropsFromAppState & ComponentProps;
type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const mapStateToProps = (state: AppState, props: AppProps) => ({
    questionnaireId: questionnaireIdFromRouteSelector(state),
});

const requestOptions: Requests<ComponentPropsWithAppState, Params> = {
    questionnaireGetRequest: {
        url: ({ props: { questionnaireId } }: { props: Props }) => `/questionnaires/${questionnaireId}/`,
        onMount: true,
        method: methods.GET,
    },
    questionnairePatchRequest: {
        url: ({ props: { questionnaireId } }: { props: Props }) => `/questionnaires/${questionnaireId}/`,
        method: methods.PATCH,
    },
};

const questionKeySelector = (q: QuestionElement) => q.id;

const FrameworkQuestion = (p) => {
    const {
        onCopyButtonClick,
        className,
        ...otherProps
    } = p;

    return (
        <div className={_cs(className, styles.frameworkQuestion)}>
            <Question {...otherProps} />
            <div className={styles.actions}>
                <Button
                    iconName="chevronLeft"
                    onClick={onCopyButtonClick}
                >
                    Copy to questionnaire
                </Button>
            </div>
        </div>
    );
};

class QuestionnaireBuilder extends React.PureComponent<Props, State> {
    public state = {
        showQuestionFormModal: false,
        showEditDetailFormModal: false,
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

    private handleEditDetailsButtonClick = () => {
        this.setState({
            showEditDetailFormModal: true,
        });
    }

    private handleCloseQuestionFormModalButtonClick = () => {
        this.setState({
            showQuestionFormModal: false,
            questionToEdit: undefined,
        });
    }

    private handleEditDetailsFormModalCloseButtonClick = () => {
        this.setState({
            showEditDetailFormModal: false,
        });
    }

    public render() {
        const {
            className,
            requests,
        } = this.props;

        const {
            showQuestionFormModal,
            showEditDetailFormModal,
            questionToEdit,
        } = this.state;

        const questionnaire = getResponse(requests, 'questionnaireGetRequest') as QuestionnaireElement;
        console.warn(questionnaire);

        return (
            <>
                <Page
                    className={_cs(styles.questionnaireBuilder, className)}
                    headerAboveSidebar
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <header className={styles.header}>
                                <h3 className={styles.heading}>
                                    Analysis framework
                                </h3>
                            </header>
                            <div className={styles.content}>
                                {questionnaire.projectFrameworkDetail && (
                                    <TreeSelection
                                        value={createReportStructure(
                                            questionnaire.projectFrameworkDetail,
                                        )}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <>
                            <div className={styles.questionList}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        { questionnaire.title }
                                    </h3>
                                    <div className={styles.actions}>
                                        <Button onClick={this.handleEditDetailsButtonClick}>
                                            Edit details
                                        </Button>
                                        <Button onClick={this.handleAddQuestionButtonClick}>
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
                                        Framework questions
                                    </h3>
                                </header>
                                {questionnaire.projectFrameworkDetail && (
                                    <ListView
                                        className={styles.content}
                                        rendererParams={this.getFrameworkQuestionRendererParams}
                                        renderer={FrameworkQuestion}
                                        data={questionnaire.projectFrameworkDetail.questions}
                                        keySelector={questionKeySelector}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    headerClassName={styles.header}
                    header={(
                        <>
                            <BackLink
                                className={styles.backLink}
                                defaultLink={reverseRoute(pathNames.homeScreen, {})}
                            />
                            <h2 className={styles.heading}>
                                Questionnaire builder ({questionnaire.title})
                            </h2>
                        </>
                    )}
                />
                {showQuestionFormModal && (
                    <Modal>
                        <ModalHeader
                            title="Add / edit question"
                            rightComponent={
                                <Button
                                    iconName="close"
                                    onClick={this.handleCloseQuestionFormModalButtonClick}
                                />
                            }
                        />
                        <ModalBody>
                            <QuestionnaireQuestionForm
                                questionnaire={questionnaire}
                                value={questionToEdit}
                            />
                        </ModalBody>
                    </Modal>
                )}
                {showEditDetailFormModal && (
                    <Modal>
                        <ModalHeader
                            title="Edit questionnaire details"
                            rightComponent={
                                <Button
                                    iconName="close"
                                    onClick={this.handleEditDetailsFormModalCloseButtonClick}
                                />
                            }
                        />
                        <ModalBody>
                            <QuestionnaireForm
                                value={questionnaire}
                            />
                        </ModalBody>
                    </Modal>
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
