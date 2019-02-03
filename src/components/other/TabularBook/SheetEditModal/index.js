import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Faram, { requiredCondition } from '#rscg/Faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';

export default class SheetEditModal extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        onSheetEdit: PropTypes.func.isRequired,
        onSheetDelete: PropTypes.func.isRequired,
        sheetId: PropTypes.number.isRequired,
        closeModal: PropTypes.func,
        disabled: PropTypes.bool,
        disabledDelete: PropTypes.bool,
    };

    static defaultProps = {
        title: '',
        closeModal: () => {},
        disabled: false,
        disabledDelete: false,
    }

    constructor(props) {
        super(props);

        const { title } = this.props;

        this.state = {
            value: { title },
            error: {},
            hasError: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            value: faramValues,
            error: faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ error: faramErrors });
    };

    handleFaramValidationSuccess = (value) => {
        const {
            onSheetEdit,
            sheetId,
            closeModal,
        } = this.props;

        onSheetEdit(sheetId, value);
        closeModal();
    };

    handleDeleteClick = () => {
        const {
            onSheetDelete,
            sheetId,
            closeModal,
        } = this.props;

        onSheetDelete(sheetId);
        closeModal();
    }

    render() {
        const { closeModal, disabled, disabledDelete } = this.props;
        const { value, error, hasError, pristine } = this.state;
        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
            >
                <ModalBody>
                    <Faram
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleFaramValidationFailure}
                        onValidationSuccess={this.handleFaramValidationSuccess}

                        schema={this.schema}
                        value={value}
                        error={error}
                        disabled={disabled}
                    >
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            label="Title"
                            autoFocus
                        />
                        <DangerButton
                            disabled={disabled || disabledDelete}
                            onClick={this.handleDeleteClick}
                        >
                            Delete Sheet
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={disabled || hasError || pristine}
                        >
                            Save
                        </PrimaryButton>
                    </Faram>
                </ModalBody>
            </Modal>
        );
    }
}

