import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import NumberInput from '#rsci/NumberInput';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';

import update from '#rsu/immutable-update';

import { RequestClient, requestMethods } from '#request';
import _ts from '#ts';


const requests = {
    saveFieldRequest: {
        method: requestMethods.PUT,
        url: ({ props }) => `/tabular-fields/${props.fieldId}/`,
        body: ({ params }) => params,
        onSuccess: ({ params, props }) => props.onChange(params),
    },
};

@RequestClient(requests)
class EditFieldModal extends React.PureComponent {
    static propTypes = {
        // eslint-disable-next-line react/no-unused-prop-types
        fieldId: PropTypes.string.isRequired,
        initialValue: PropTypes.shape({}).isRequired,
        // eslint-disable-next-line react/no-unused-prop-types
        onChange: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        saveFieldRequest: RequestClient.prop.isRequired,
    };

    static fieldTypes = [
        { key: 'string', label: 'String' },
        { key: 'number', label: 'Number' },
    ];

    static separatorOptions = [
        { key: 'space', label: 'Space' },
        { key: 'comma', label: 'Comma' },
        { key: 'none', label: 'None' },
    ];

    constructor(props) {
        super(props);

        const initialValue = update(props.initialValue, {
            options: { $auto: {
                precision: { $setDefault: 2 },
                separator: { $setDefault: 'space' },
            } },
        });

        this.state = {
            faramValues: initialValue,
            faramErrors: {},
        };

        this.schema = {
            fields: {
                type: [requiredCondition],
                title: [requiredCondition],
                options: [],
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
        this.props.saveFieldRequest.do(value);
    }

    renderSettingsForType = (type) => {
        if (type === 'number') {
            return (
                <React.Fragment>
                    <NumberInput
                        faramElementName="precision"
                        label={_ts('tabular', 'editFieldPrecisionLabel')}
                        showLabel
                        showHintAndError
                    />
                    <SegmentInput
                        faramElementName="separator"
                        label={_ts('tabular', 'editFieldSeparatorLabel')}
                        options={EditFieldModal.separatorOptions}
                        showLabel
                        showHintAndError
                    />
                </React.Fragment>
            );
        }

        return <div />;
    }

    render() {
        const {
            faramValues,
            faramErrors,
        } = this.state;

        const { pending } = this.props.saveFieldRequest;

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
                    {pending && <LoadingAnimation />}
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
                            options={EditFieldModal.fieldTypes}
                            showLabel
                            showHintAndError
                        />
                        <FaramGroup faramElementName="options">
                            {this.renderSettingsForType(faramValues.type)}
                        </FaramGroup>
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
        fieldId: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.shape({}).isRequired,
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
                fieldId={this.props.fieldId}
                initialValue={this.props.value}
                onCancel={this.handleCancel}
                onChange={this.handleChange}
            />
        );
    }

    render() {
        const {
            fieldId, // eslint-disable-line no-unused-vars
            value, // eslint-disable-line no-unused-vars
            onChange, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <React.Fragment>
                <AccentButton
                    {...otherProps}
                    onClick={this.handleEdit}
                />
                {this.renderModal()}
            </React.Fragment>
        );
    }
}
