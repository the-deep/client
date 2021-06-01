import React, { useCallback } from 'react';

import { useModalState } from '#hooks/stateManagement';
import { MdEdit } from 'react-icons/md';
import { Button } from '@the-deep/deep-ui';

import AddStakeholderModal, { FormType } from '#components/general/AddStakeholderModal';

interface Props {
    onChange: (value: FormType) => void;
    value?: FormType;
    className?: string;
    disabled?: boolean;
}

function AddStakeholderButton(props: Props) {
    const {
        className,
        disabled,
        value,
        onChange,
    } = props;

    const [
        showModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const handleShowStakeholdersModal = useCallback(() => {
        if (showModal) {
            setModalHidden();
        } else {
            setModalVisible();
        }
    }, [setModalHidden, setModalVisible, showModal]);

    return (
        <>
            <Button
                className={className}
                name={undefined}
                variant="tertiary"
                onClick={handleShowStakeholdersModal}
                disabled={disabled}
                icons={<MdEdit />}
            />
            {showModal && (
                <AddStakeholderModal
                    onChange={onChange}
                    value={value}
                    onModalClose={setModalHidden}
                />
            )}
        </>
    );
}

export default AddStakeholderButton;
