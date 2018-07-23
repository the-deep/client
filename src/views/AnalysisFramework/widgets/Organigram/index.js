import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import TextInput from '#rs/components/Input/TextInput';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';

import Faram, { requiredCondition } from '#rs/components/Input/Faram';

import OrganigramCreatorInput from '#components/OrganigramCreatorInput';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: undefined,
};

export default class Organigram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            data: [],
        },
    };

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
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (faramValues) => {
        const {
            title,
            data,
        } = faramValues;
        this.props.onSave(data, title);
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;

        const textInputLabel = _ts('framework.organigramWidget', 'titleLabel');
        const textInputPlaceholder = _ts('framework.organigramWidget', 'titlePlaceholderScale');
        const cancelButtonLabel = _ts('framework.organigramWidget', 'cancelButtonLabel');
        const saveButtonLabel = _ts('framework.organigramWidget', 'saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Organigram.schema}
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
                        <div className={styles.organs}>
                            <OrganigramCreatorInput
                                faramElementName="data"
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
