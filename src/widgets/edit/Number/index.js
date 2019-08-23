import PropTypes from 'prop-types';
import React from 'react';
import Faram, { requiredCondition } from '@togglecorp/faram';
import { isTruthy } from '@togglecorp/fujs';

import NumberInput from '#rsci/NumberInput';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ModalFooter from '#rscv/Modal/Footer';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

export default class NumberEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        validation: ({ minValue: min, maxValue: max } = {}) => {
            const errors = [];
            if (isTruthy(min) && isTruthy(max) && min >= max) {
                errors.push(_ts('widgets.editor.number', 'minGreaterThanMaxError'));
            }
            return errors;
        },
        fields: {
            title: [requiredCondition],
            minValue: [],
            maxValue: [],
        },
    }

    static getDataFromFaramValues = (data) => {
        const {
            minValue,
            maxValue,
        } = data;
        return { minValue, maxValue };
    };

    static getTitleFromFaramValues = data => data.title;

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                minValue,
                maxValue,
            },
        } = this.props;

        this.state = {
            faramErrors: {},
            faramValues: {
                title,
                maxValue,
                minValue,
            },
            pristine: true,
            hasError: false,
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });

        const {
            widgetKey,
            onChange,
        } = this.props;
        onChange(
            widgetKey,
            NumberEditWidget.getDataFromFaramValues(faramValues),
            NumberEditWidget.getTitleFromFaramValues(faramValues),
        );
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    }

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            onSave,
            closeModal,
            widgetKey,
        } = this.props;

        onSave(
            widgetKey,
            NumberEditWidget.getDataFromFaramValues(faramValues),
            NumberEditWidget.getTitleFromFaramValues(faramValues),
        );
        closeModal();
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
        } = this.state;

        const {
            closeModal,
            title,
        } = this.props;

        const titleInputLabel = _ts('widgets.editor.number', 'titleLabel');
        const titleInputPlaceholder = _ts('widgets.editor.number', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('widgets.editor.number', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.number', 'saveButtonLabel');
        const cancelConfirmMessage = _ts('widgets.editor.number', 'cancelConfirmMessage');
        const separatorText = ' ';

        return (
            <Modal>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={NumberEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody>
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            label={titleInputLabel}
                            placeholder={titleInputPlaceholder}
                            className={styles.input}
                            autoFocus
                            selectOnFocus
                        />
                        <div className={styles.numberContainer} >
                            <NumberInput
                                faramElementName="minValue"
                                className={styles.input}
                                placeholder={_ts('widgets.editor.number', 'numberPlaceholder')}
                                label={_ts('widgets.editor.number', 'minValueLabel')}
                                separator={separatorText}
                            />
                            <NumberInput
                                faramElementName="maxValue"
                                className={styles.input}
                                placeholder={_ts('widgets.editor.number', 'numberPlaceholder')}
                                label={_ts('widgets.editor.number', 'maxValueLabel')}
                                separator={separatorText}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={closeModal}
                            confirmationMessage={cancelConfirmMessage}
                            skipConfirmation={pristine}
                        >
                            {cancelButtonLabel}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
