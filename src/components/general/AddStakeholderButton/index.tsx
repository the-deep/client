import React from 'react';

import { useModalState } from '#hooks/stateManagement';
import { MdEdit } from 'react-icons/md';
import { Button } from '@the-deep/deep-ui';
import AddStakeholderModal, { Props as AddStakeholderModalProps } from '#components/general/AddStakeholderModal';

type Props<T> = AddStakeholderModalProps<T> & {
    className?: string;
    disabled?: boolean;
}

function AddStakeholderButton<T extends string>(props: Props<T>) {
    const {
        className,
        disabled,
        ...stakeholderModalProps
    } = props;

    const [
        showModal,
        ,
        hideModal,
        ,
        toggleModalShow,
    ] = useModalState(false);

    return (
        <>
            <Button
                className={className}
                name={undefined}
                variant="tertiary"
                onClick={toggleModalShow}
                disabled={disabled}
                icons={<MdEdit />}
            />
            {showModal && (
                <AddStakeholderModal
                    {...stakeholderModalProps}
                    onModalClose={hideModal}
                />
            )}
        </>
    );
}

export default AddStakeholderButton;
