import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ListView from '#rscv/List/ListView';

import Question from '#qbc/Question';

import {
    QuestionElement,
    FrameworkElement,
} from '#typings';

import FrameworkQuestionForm from './FrameworkQuestionForm';
import styles from './styles.scss';

const AddQuestionModal = ({
    onCloseButtonClick,
    framework,
    value,
}: {
    onCloseButtonClick?: () => void;
    framework: FrameworkElement;
    value?: QuestionElement;
}) => (
    <Modal>
        <ModalHeader
            title="Add question"
            rightComponent={
                <Button
                    iconName="close"
                    onClick={onCloseButtonClick}
                />
            }
        />
        <ModalBody>
            <FrameworkQuestionForm
                framework={framework}
                value={value}
            />
        </ModalBody>
    </Modal>
);

interface Props {
    framework: FrameworkElement;
    className?: string;
}

interface State {
    showQuestionModal: boolean;
    questionToEdit: QuestionElement | undefined;
}

class Questions extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            showQuestionModal: false,
            questionToEdit: undefined,
        };
    }

    private getQuestionRendererParams = (key: QuestionElement['id'], question: QuestionElement) => ({
        data: question,
        onEditButtonClick: this.handleEditQuestionButtonClick,
        className: styles.question,
        framework: this.props.framework,
    })

    private handleEditQuestionButtonClick = (questionKey: QuestionElement['id']) => {
        const {
            framework: {
                questions,
            },
        } = this.props;

        const question = questions.find(d => d.id === questionKey);
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

    render() {
        const {
            className,
            framework,
        } = this.props;

        const {
            showQuestionModal,
            questionToEdit,
        } = this.state;

        return (
            <div className={_cs(styles.questions, className)}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        Questions
                    </h3>
                    <div className={styles.actions}>
                        <Button
                            className={styles.addQuestionButton}
                            onClick={this.handleAddQuestionButtonClick}
                        >
                            Add question
                        </Button>
                    </div>
                </header>
                <ListView
                    className={styles.content}
                    data={framework.questions}
                    renderer={Question}
                    rendererParams={this.getQuestionRendererParams}
                    keySelector={(d: QuestionElement) => d.id}
                />
                {showQuestionModal && (
                    <AddQuestionModal
                        framework={framework}
                        value={questionToEdit}
                        onCloseButtonClick={this.handleAddQuestionModalCloseButtonClick}
                    />
                )}
            </div>
        );
    }
}

export default Questions;
