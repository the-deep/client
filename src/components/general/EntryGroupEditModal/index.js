import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import Faram from '@togglecorp/faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import _ts from '#ts';

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
        createMode,
        className,
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
            className={className}
            closeOnEscape
            onClose={closeModal}
        >
            <ModalHeader
                title={createMode ? (
                    _ts('editEntry.group.editModal', 'createEntryGroupModalTitle')
                ) : (
                    _ts('editEntry.group.editModal', 'editEntryGroupModalTitle')
                )}
                rightComponent={
                    <Button
                        onClick={closeModal}
                        transparent
                        iconName="close"
                    />
                }
            />
            <Faram
                onChange={handleFaramChange}
                onValidationFailure={handleFaramValidationFailure}
                onValidationSuccess={handleFaramValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
            >
                <ModalBody>
                    <NonFieldErrors faramElement />
                    <TextInput
                        faramElementName="title"
                        label={_ts('editEntry.group.editModal', 'entryGroupTitleLabel')}
                        autoFocus
                    />
                </ModalBody>
                <ModalFooter>
                    <DangerButton
                        onClick={closeModal}
                    >
                        {_ts('editEntry.group.editModal', 'cancelButtonTitle')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        disabled={pristine}
                    >
                        {_ts('editEntry.group.editModal', 'saveButtonTitle')}
                    </PrimaryButton>
                </ModalFooter>
            </Faram>
        </Modal>
    );
};
EntryGroupEditModal.propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    closeModal: PropTypes.func,
    createMode: PropTypes.bool,
};
EntryGroupEditModal.defaultProps = {
    title: undefined,
    className: undefined,
    closeModal: () => {},
    createMode: false,
};

export default EntryGroupEditModal;
