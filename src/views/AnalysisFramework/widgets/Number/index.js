import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '#rs/components/Input/NumberInput';
import TextInput from '#rs/components/Input/TextInput';
import Button from '#rs/components/Action/Button';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import ModalFooter from '#rs/components/View/Modal/Footer';
import BoundError from '#rs/components/General/BoundError';
import Faram from '#rs/components/Input/Faram';
import { isTruthy } from '#rsu/common';

import WidgetError from '#components/WidgetError';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

@BoundError(WidgetError)
export default class NumberFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            title,
            editAction,
            data: {
                minValue,
                maxValue,
            } = {},
        } = this.props;

        const faramValues = {
            title,
            maxValue,
            minValue,
        };

        this.state = {
            showEditModal: false,
            faramErrors: {},
            faramValues,

            pristine: false,
        };

        this.schema = {
            validation: ({ minValue: min, maxValue: max } = {}) => {
                const errors = [];
                if (isTruthy(min) && isTruthy(max) && min >= max) {
                    // FIXME: use strings
                    errors.push('Min value must be less than max value.');
                }
                return errors;
            },
            fields: {
                title: [],
                minValue: [],
                maxValue: [],
            },
        };

        editAction(this.handleEdit);
    }

    handleFaramChange = (faramValues) => {
        this.setState({
            faramValues,
            pristine: true,
        });
    }

    handleValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    }

    handleValidationSuccess = (values) => {
        this.setState({
            showEditModal: false,
            faramValues: values,
            pristine: false,
        });
        const {
            title,
            minValue,
            maxValue,
        } = values;

        this.props.onChange(
            {
                minValue,
                maxValue,
            },
            title,
        );
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleModalCancelButtonClick = () => {
        const {
            title,
            data: {
                minValue,
                maxValue,
            } = {},
        } = this.props;

        this.setState({
            showEditModal: false,
            faramValues: {
                title,
                minValue,
                maxValue,
            },
        });
    }

    renderEditModal = () => {
        const {
            faramValues,
            faramErrors,
            showEditModal,
            pristine,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const headerTitle = _ts('framework.numberWidget', 'editTitleModalHeader');
        const titleInputLabel = _ts('framework.numberWidget', 'titleLabel');
        const titleInputPlaceholder = _ts('framework.numberWidget', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('framework.numberWidget', 'cancelButtonLabel');
        const saveButtonLabel = _ts('framework.numberWidget', 'saveButtonLabel');
        const separatorText = ' ';

        return (
            <Modal>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={headerTitle} />
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
                                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
                                label={_ts('framework.numberWidget', 'minValueLabel')}
                                separator={separatorText}
                            />
                            <NumberInput
                                faramElementName="maxValue"
                                className={styles.input}
                                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
                                label={_ts('framework.numberWidget', 'maxValueLabel')}
                                separator={separatorText}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.handleModalCancelButtonClick}>
                            { cancelButtonLabel }
                        </Button>
                        <PrimaryButton
                            disabled={!pristine}
                            type="submit"
                        >
                            { saveButtonLabel }
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }

    render() {
        const EditModal = this.renderEditModal;
        const separatorText = ' ';

        return (
            <div className={styles.list}>
                <NumberInput
                    className={styles.input}
                    placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
                    showLabel={false}
                    showHintAndError={false}
                    separator={separatorText}
                    disabled
                />
                <EditModal />
            </div>
        );
    }
}
