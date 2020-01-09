import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import Faram from '@togglecorp/faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

const schema = {
    fields: {
        title: [],
    },
};

const EntryGroupEditModal = (props) => {
    const {
        closeModal,
        title,
        onSave,
    } = props;

    const [faramValues, setFaramValues] = useState({ title });
    const [faramErrors, setFaramErrors] = useState({});
    const [pristine, setPristine] = useState(true);

    const handleFaramValidationFailure = useCallback(
        (errors) => {
            setFaramErrors(errors);
        },
        [],
    );

    const handleFaramValidationSuccess = useCallback(
        (_, values) => {
            onSave(values);
            closeModal();
        },
        [closeModal, onSave],
    );

    const handleFaramChange = useCallback(
        (values, errors) => {
            setFaramValues(values);
            setFaramErrors(errors);
            setPristine(false);
        },
        [],
    );

    return (
        <Modal
            closeOnEscape
            onClose={closeModal}
        >
            <ModalHeader
                title="Edit Entry Group"
                rightComponent={
                    <DangerButton
                        onClick={closeModal}
                        transparent
                        iconName="close"
                    />
                }
            />
            <ModalBody>
                <Faram
                    onChange={handleFaramChange}
                    onValidationFailure={handleFaramValidationFailure}
                    onValidationSuccess={handleFaramValidationSuccess}
                    schema={schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <NonFieldErrors faramElement />
                    <TextInput
                        faramElementName="title"
                        // FIXME: use strings
                        label="Title"
                        autoFocus
                    />
                    <PrimaryButton
                        type="submit"
                        disabled={pristine}
                    >
                        {/* FIXME: use strings */}
                        Save
                    </PrimaryButton>
                </Faram>
            </ModalBody>
        </Modal>
    );
};
EntryGroupEditModal.propTypes = {
    title: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    closeModal: PropTypes.func,
};
EntryGroupEditModal.defaultProps = {
    title: undefined,
    closeModal: () => {},
};

export default EntryGroupEditModal;
