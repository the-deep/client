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
    editMode: PropTypes.bool,
    initialValue: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    editMode: false,
    initialValue: {},
};

export default class NewCategoryModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    static schema = {
        fields: {
            title: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        const { title = '' } = props.initialValue || {};
        this.state = {
            schema: NewCategoryModal.schema,
            faramErrors: {},
            faramValues: { title },
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

    handleFaramValidationSuccess = (_, { title }) => {
        this.props.onSubmit(title);
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const { editMode } = this.props;
        const {
            faramErrors,
            faramValues,
            schema,
            pristine,
        } = this.state;

        const title = editMode
            ? _ts('categoryEditor.newCategory', 'editCategoryTooltip')
            : _ts('categoryEditor.newCategory', 'addCategoryTooltip');

        return (
            <Modal className={styles.newCategoryModal} >
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
                        title={title}
                    />
                    <ModalBody key="body">
                        <TextInput
                            faramElementName="title"
                            label={_ts('categoryEditor.newCategory', 'addCategoryTitleLabel')}
                            placeholder={_ts('categoryEditor.newCategory', 'addCategoryTitlePlaceholder')}
                            autoFocus
                        />
                    </ModalBody>
                    <ModalFooter key="footer">
                        <Button onClick={this.handleModalClose} >
                            {_ts('categoryEditor.newCategory', 'modalCancel')}
                        </Button>
                        <PrimaryButton
                            className={styles.okButton}
                            disabled={pristine}
                            type="submit"
                        >
                            {_ts('categoryEditor.newCategory', 'modalOk')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
