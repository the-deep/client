import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import TextInput from '#rsci/TextInput';
import NumberInput from '#rsci/NumberInput';
import SegmentInput from '#rsci/SegmentInput';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import update from '#rsu/immutable-update';
import _ts from '#ts';


export default class EditFieldModal extends React.PureComponent {
    static propTypes = {
        initialValue: PropTypes.shape({}).isRequired,
        onChange: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    static fieldTypes = [
        { key: 'string', label: 'String' },
        { key: 'number', label: 'Number' },
        { key: 'datetime', label: 'Date' },
        { key: 'geo', label: 'Geo' },
    ];

    static separatorOptions = [
        { key: 'space', label: 'Space' },
        { key: 'comma', label: 'Comma' },
        { key: 'none', label: 'None' },
    ];

    static geoTypeOptions = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
    ];

    constructor(props) {
        super(props);

        const initialValue = update(props.initialValue, {
            options: { $auto: {
                separator: { $setDefault: 'none' },
                geoType: { $setDefault: 'name' },
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
        this.props.onChange(value);
    }

    renderSettingsForType = (type) => {
        if (type === 'number') {
            return (
                <SegmentInput
                    faramElementName="separator"
                    label={_ts('tabular.editField', 'separatorLabel')}
                    options={EditFieldModal.separatorOptions}
                    showLabel
                    showHintAndError
                />
            );
        }

        if (type === 'geo') {
            return (
                <React.Fragment>
                    <SegmentInput
                        faramElementName="geoType"
                        label={_ts('tabular.editField', 'geoTypeLabel')}
                        options={EditFieldModal.geoTypeOptions}
                        showLabel
                        showHintAndError
                    />
                    <NumberInput
                        faramElementName="adminLevel"
                        label={_ts('tabular.editField', 'adminLevelLabel')}
                        placeholder={_ts('tabular.editField', 'adminLevelPlaceholder')}
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

        return (
            <Modal>
                <ModalHeader title={_ts('tabular.editField', 'title')} />
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
                            label={_ts('tabular.editField', 'titleLabel')}
                            showLabel
                            showHintAndError
                        />
                        <SegmentInput
                            faramElementName="type"
                            label={_ts('tabular.editField', 'typeLabel')}
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
                            {_ts('tabular.editField', 'cancelLabel')}
                        </DangerButton>
                        <PrimaryButton type="submit">
                            {_ts('tabular.editField', 'submitLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
