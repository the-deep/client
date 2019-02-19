import React from 'react';
import PropTypes from 'prop-types';
import Faram, { requiredCondition } from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
};

export default class NewSubcategoryModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    static schema = {
        fields: {
            title: [requiredCondition],
            description: [],
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            schema: NewSubcategoryModal.schema,
            faramErrors: {},
            faramValues: {},
            pristine: true,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (_, { title, description }) => {
        this.props.onSubmit({
            title,
            description,
        });
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            faramErrors,
            faramValues,
            schema,
            pristine,
        } = this.state;

        return (
            <Modal
                className={styles.newSubcategoryModal}
            >
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader
                        key="header"
                        title={_ts('categoryEditor.newSubcategory', 'addNewSubCategoryModalTitle')}
                    />
                    <ModalBody key="body">
                        <TextInput
                            faramElementName="title"
                            label={_ts('categoryEditor.newSubcategory', 'addSubCategoryTitleLabel')}
                            placeholder={_ts('categoryEditor.newSubcategory', 'addSubCategoryTitlePlaceholder')}
                            autoFocus
                        />
                        <TextInput
                            faramElementName="description"
                            label={_ts('categoryEditor.newSubcategory', 'addSubCategoryDescriptionLabel')}
                            placeholder={_ts('categoryEditor.newSubcategory', 'addSubCategoryDescriptionPlaceholder')}
                        />
                    </ModalBody>
                    <ModalFooter key="footer">
                        <Button onClick={this.handleModalClose}>
                            {_ts('categoryEditor.newSubcategory', 'modalCancel')}
                        </Button>
                        <PrimaryButton
                            className={styles.okButton}
                            disabled={pristine}
                            type="submit"
                        >
                            {_ts('categoryEditor.newSubcategory', 'modalOk')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
