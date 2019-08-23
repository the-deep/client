import PropTypes from 'prop-types';
import React from 'react';
import Faram, { requiredCondition } from '@togglecorp/faram';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';

import OrganigramCreatorInput from '#components/input/OrganigramCreatorInput';
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
    data: undefined,
};

export default class OrganigramEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            data: [],
        },
    };

    static getDataFromFaramValues = (data) => {
        const {
            data: orgData,
        } = data;
        return { data: orgData };
    };

    static getTitleFromFaramValues = data => data.title;

    constructor(props) {
        super(props);

        const {
            title,
            data,
        } = props;

        this.state = {
            faramValues: {
                title,
                data,
            },
            faramErrors: {},
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
            OrganigramEditWidget.getDataFromFaramValues(faramValues),
            OrganigramEditWidget.getTitleFromFaramValues(faramValues),
        );
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            onSave,
            closeModal,
            widgetKey,
        } = this.props;

        onSave(
            widgetKey,
            OrganigramEditWidget.getDataFromFaramValues(faramValues),
            OrganigramEditWidget.getTitleFromFaramValues(faramValues),
        );
        closeModal();
    };

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

        const textInputLabel = _ts('widgets.editor.organigram', 'titleLabel');
        const textInputPlaceholder = _ts('widgets.editor.organigram', 'titlePlaceholderScale');
        const cancelButtonLabel = _ts('widgets.editor.organigram', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.organigram', 'saveButtonLabel');
        const organigramStructureTitle = _ts('widgets.editor.organigram', 'organigramStructureTitle');
        const cancelConfirmMessage = _ts('widgets.editor.organigram', 'cancelConfirmMessage');

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={OrganigramEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors faramElement />
                        <div className={styles.titleInputContainer}>
                            <TextInput
                                className={styles.titleInput}
                                faramElementName="title"
                                label={textInputLabel}
                                placeholder={textInputPlaceholder}
                                showHintAndError={false}
                                autoFocus
                                selectOnFocus
                            />
                        </div>
                        <header className={styles.organigramStructureHeader}>
                            <h4>
                                {organigramStructureTitle}
                            </h4>
                        </header>
                        <div className={styles.organs}>
                            <OrganigramCreatorInput
                                faramElementName="data"
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
