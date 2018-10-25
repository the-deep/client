import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';

import _ts from '#ts';

class EditFieldModal extends React.PureComponent {
    static propTypes = {
        initialLabel: PropTypes.string.isRequired,
        initialType: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    static FIELD_TYPES = [
        { key: 'string', label: 'String' },
        { key: 'number', label: 'Number' },
    ];

    constructor(props) {
        super(props);

        this.state = {
            faramValues: {
                title: props.initialLabel,
                type: props.initialType,
            },
            faramErrors: {},
        };

        this.schema = {
            fields: {
                type: [requiredCondition],
                title: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFaramValidationSuccess = (value) => {
        this.props.onChange(value);
    }

    render() {
        const {
            faramValues,
            faramErrors,
        } = this.state;

        return (
            <Modal>
                <ModalHeader title={_ts('tabular', 'editFieldTitle')} />
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalBody>
                        <TextInput
                            faramElementName="title"
                            label={_ts('tabular', 'editFieldTitleLabel')}
                            showLabel
                            showHintAndError
                        />
                        <SelectInput
                            faramElementName="type"
                            label={_ts('tabular', 'editFieldTypeLabel')}
                            options={EditFieldModal.FIELD_TYPES}
                            showLabel
                            showHintAndError
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={this.props.onCancel}>
                            {_ts('tabular', 'editFieldCancelLabel')}
                        </DangerButton>
                        <PrimaryButton type="submit">
                            {_ts('tabular', 'editFieldSubmitLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}

// eslint-disable-next-line react/no-multi-comp
export default class EditFieldButton extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    };

    state = {
        showModal: false,
    }

    handleEdit = () => {
        this.setState({ showModal: true });
    }

    handleCancel = () => {
        this.setState({ showModal: false });
    }

    handleChange = (values) => {
        this.setState({ showModal: false }, () => {
            this.props.onChange(values);
        });
    }

    renderModal = () => {
        if (!this.state.showModal) {
            return false;
        }

        return (
            <EditFieldModal
                initialLabel={this.props.title}
                initialType={this.props.type}
                onCancel={this.handleCancel}
                onChange={this.handleChange}
            />
        );
    }

    render() {
        return (
            <React.Fragment>
                <AccentButton
                    {...this.props}
                    onClick={this.handleEdit}
                />
                {this.renderModal()}
            </React.Fragment>
        );
    }
}
