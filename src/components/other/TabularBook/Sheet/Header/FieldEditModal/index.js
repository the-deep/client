import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Faram, { requiredCondition } from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import NonFieldErrors from '#rsci/NonFieldErrors';
import NumberInput from '#rsci/NumberInput';
import SegmentInput from '#rsci/SegmentInput';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';

import { DATA_TYPE } from '#entities/tabular';

const DATE_FORMATS = [
    { format: '%m-%d-%Y', label: 'mm-dd-yyyy' },
    { format: '%m/%d/%Y', label: 'mm/dd/yyyy' },
    { format: '%m.%d.%Y', label: 'mm.dd.yyyy' },
    { format: '%m %d %Y', label: 'mm dd yyyy' },
    { format: '%Y-%m-%d', label: 'yyyy-mm-dd' },
    { format: '%Y/%m/%d', label: 'yyyy/mm/dd' },
    { format: '%Y.%m.%d', label: 'yyyy.mm.dd' },
    { format: '%Y %m %d', label: 'yyyy mm dd' },
    { format: '%d %b %Y', label: 'dd mmm yyyy' },
    { format: '%d-%b-%Y', label: 'dd-mmm-yyyy' },
    { format: '%d/%b/%Y', label: 'dd/mmm/yyyy' },
    { format: '%d.%b.%Y', label: 'dd.mmm.yyyy' },
    { format: '%Y %b %d', label: 'yyyy mmm dd' },
    { format: '%Y %B %d', label: 'yyyy mmmm dd' },
    { format: '%d %B %Y', label: 'dd mmmm yyyy' },
    { format: '%d-%m-%Y', label: 'dd-mm-yyyy' },
    { format: '%d/%m/%Y', label: 'dd/mm/yyyy' },
    { format: '%d.%m.%Y', label: 'dd.mm.yyyy' },
    { format: '%d %m %Y', label: 'dd mm yyyy' },
];

const fieldTypes = [
    { key: DATA_TYPE.string, label: 'String' },
    { key: DATA_TYPE.number, label: 'Number' },
    { key: DATA_TYPE.datetime, label: 'Date' },
    { key: DATA_TYPE.geo, label: 'Geo' },
];

const separatorOptions = [
    { key: 'space', label: 'Space' },
    { key: 'comma', label: 'Comma' },
    { key: 'none', label: 'None' },
];

const geoTypeOptions = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
];

export default class FieldEditModal extends React.PureComponent {
    static propTypes = {
        onFieldEdit: PropTypes.func.isRequired,
        onFieldDelete: PropTypes.func.isRequired,
        fieldId: PropTypes.number.isRequired,
        closeModal: PropTypes.func,
        disabled: PropTypes.bool,
        disabledDelete: PropTypes.bool,
        // eslint-disable-next-line react/forbid-prop-types
        value: PropTypes.object.isRequired,
    };

    static defaultProps = {
        closeModal: () => {},
        disabled: false,
        disabledDelete: false,
    }

    static fieldKeySelector = d => d.id;
    static getFormatValue = x => x.format;
    static getLabelValue = x => x.label;

    constructor(props) {
        super(props);

        const { value } = this.props;

        this.state = {
            value,
            error: {},
            hasError: false,
            pristine: true,
        };

        const commonFields = {
            id: [requiredCondition],
            title: [requiredCondition],
            type: [requiredCondition],
            ordering: [],
            hidden: [],
        };
        this.schema = {
            identifier: (val = {}) => val.type,
            fields: { // the name of the actual field is "fields"
                default: {
                    ...commonFields,
                },
                [DATA_TYPE.string]: {
                    ...commonFields,
                },
                [DATA_TYPE.number]: {
                    ...commonFields,
                    options: {
                        fields: {
                            separator: [requiredCondition],
                        },
                    },
                },
                [DATA_TYPE.geo]: {
                    ...commonFields,
                    options: {
                        fields: {
                            geoType: [requiredCondition],
                            adminLevel: [requiredCondition],
                        },
                    },
                },
                [DATA_TYPE.datetime]: {
                    ...commonFields,
                    options: {
                        fields: {
                            dateFormat: [requiredCondition],
                        },
                    },
                },
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
            onFieldEdit,
            fieldId,
            closeModal,
        } = this.props;

        onFieldEdit(fieldId, value);
        closeModal();
    };

    handleDeleteClick = () => {
        const {
            onFieldDelete,
            fieldId,
            closeModal,
        } = this.props;

        onFieldDelete(fieldId);
        closeModal();
    }

    renderSettingsForType = (type) => {
        if (type === DATA_TYPE.number) {
            return (
                <SegmentInput
                    faramElementName="separator"
                    label="Separator"
                    options={separatorOptions}
                />
            );
        }

        if (type === DATA_TYPE.geo) {
            return (
                <React.Fragment>
                    <SegmentInput
                        faramElementName="geoType"
                        label="Geo Type"
                        options={geoTypeOptions}
                    />
                    <NumberInput
                        faramElementName="adminLevel"
                        label="Admin Level"
                    />
                </React.Fragment>
            );
        }

        if (type === DATA_TYPE.datetime) {
            return (
                <SelectInput
                    faramElementName="dateFormat"
                    label="Date Type"
                    options={DATE_FORMATS}
                    keySelector={FieldEditModal.getFormatValue}
                    labelSelector={FieldEditModal.getLabelValue}
                    hideClearButton
                />
            );
        }

        return <div />;
    }

    render() {
        const { closeModal, disabled, disabledDelete } = this.props;
        const {
            value,
            error,
            hasError,
            pristine,
        } = this.state;
        const { type } = value;

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
                        <SegmentInput
                            faramElementName="type"
                            label="Type"
                            options={fieldTypes}
                        />

                        <FaramGroup faramElementName="options">
                            {this.renderSettingsForType(type)}
                        </FaramGroup>

                        <DangerButton
                            disabled={disabled || disabledDelete}
                            onClick={this.handleDeleteClick}
                        >
                            Delete Field
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

