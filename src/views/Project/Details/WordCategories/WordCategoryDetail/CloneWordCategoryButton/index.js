import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import Faram, {
    requiredCondition,
} from '#rscg/Faram';

import _ts from '#ts';

import WordCategoryCloneRequest from './requests/WordCategoryCloneRequest';
import styles from './styles.scss';

const propTypes = {
    addNewWordCategory: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    wordCategoryId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    setActiveWordCategory: PropTypes.func.isRequired,
};

const defaultProps = {
    disabled: false,
};

export default class CloneWordCategoryButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showCloneWordCategoryModal: false,
            faramErrors: {},
            faramValues: {},
            pendingWordCategoryClone: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };

        const {
            addNewWordCategory,
            setActiveWordCategory,
        } = props;

        this.wordCategoryCloneRequest = new WordCategoryCloneRequest({
            setState: v => this.setState(v),
            onModalClose: this.onModalClose,
            addNewWordCategory,
            setActiveWordCategory,
        });
    }

    componentWillUnmount() {
        this.wordCategoryCloneRequest.stop();
    }

    onModalClose = () => {
        this.setState({
            showCloneWordCategoryModal: false,
            faramValues: {},
            faramErrors: {},
            pristine: true,
        });
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleValidationSuccess = () => {
        const {
            wordCategoryId,
            projectId,
        } = this.props;

        const { faramValues } = this.state;

        this.wordCategoryCloneRequest
            .init(
                wordCategoryId,
                projectId,
                faramValues,
            )
            .start();
    }

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleClick = () => {
        this.setState({ showCloneWordCategoryModal: true });
    }

    render() {
        const { disabled } = this.props;
        const {
            showCloneWordCategoryModal,
            faramValues,
            faramErrors,
            pristine,
            pendingWordCategoryClone,
        } = this.state;

        return (
            <React.Fragment>
                <AccentButton
                    disabled={disabled}
                    onClick={this.handleClick}
                >
                    { _ts('project.wordCategory', 'cloneButtonTitle') }
                </AccentButton>
                { showCloneWordCategoryModal && (
                    <Modal className={styles.cloneWordCategoryModal}>
                        <Faram
                            onChange={this.handleFaramChange}
                            onValidationFailure={this.handleValidationFailure}
                            onValidationSuccess={this.handleValidationSuccess}
                            schema={this.schema}
                            value={faramValues}
                            error={faramErrors}
                            disabled={pendingWordCategoryClone}
                        >
                            <ModalHeader title={_ts('project.wordCategory', 'cloneWordCategoryModalTitle')} />
                            <ModalBody>
                                { pendingWordCategoryClone && <LoadingAnimation /> }
                                <NonFieldErrors faramElement />
                                <TextInput
                                    label={_ts('project.wordCategory', 'wordCategoryTitleInputTitle')}
                                    faramElementName="title"
                                    placeholder={_ts('project.wordCategory', 'wordCategoryTitleInputPlaceholder')}
                                    autoFocus
                                />
                            </ModalBody>
                            <ModalFooter>
                                <DangerButton onClick={this.onModalClose}>
                                    {_ts('project.wordCategory', 'cloneWordCategoryCancelButtonTitle')}
                                </DangerButton>
                                <PrimaryButton
                                    disabled={pendingWordCategoryClone || pristine}
                                    type="submit"
                                >
                                    {_ts('project.wordCategory', 'cloneWordCategoryCloneButtonTitle')}
                                </PrimaryButton>
                            </ModalFooter>
                        </Faram>
                    </Modal>
                )}
            </React.Fragment>
        );
    }
}
