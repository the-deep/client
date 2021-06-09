import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import _ts from '#ts';

import AddWordCategoryForm from '../../AddWordCategoryForm';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    setActiveWordCategory: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    disabled: false,
};

export default class AddWordCategoryButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = { showAddWordCategoryModal: false };

    handleAddWordCategoryButtonClick = () => {
        this.setState({ showAddWordCategoryModal: true });
    }

    handleAddProjectModalClose = () => {
        this.setState({ showAddWordCategoryModal: false });
    }

    render() {
        const {
            projectId,
            className: classNameFromProps,
            setActiveWordCategory,
            disabled,
        } = this.props;

        const { showAddWordCategoryModal } = this.state;

        const className = `
            ${classNameFromProps}
        `;
        return (
            <React.Fragment>
                <AccentButton
                    className={className}
                    iconName="add"
                    onClick={this.handleAddWordCategoryButtonClick}
                    disabled={disabled}
                >
                    { _ts('project.wordCategory', 'addWordCategoryButtonLabel')}
                </AccentButton>
                { showAddWordCategoryModal && (
                    <Modal className={styles.addWordCategoryModal}>
                        <ModalHeader title={_ts('project.wordCategory', 'addWordCategoryModalTitle')} />
                        <ModalBody className={styles.modalBody}>
                            <AddWordCategoryForm
                                projectId={projectId}
                                onModalClose={this.handleAddProjectModalClose}
                                setActiveWordCategory={setActiveWordCategory}
                            />
                        </ModalBody>
                    </Modal>
                )}
            </React.Fragment>
        );
    }
}
