import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { Button } from '@the-deep/deep-ui';

import AddStakeholderModal, { Props as AddStakeholderModalProps } from '#newComponents/general/AddStakeholderModal';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

type Props<T> = Omit<AddStakeholderModalProps<T>, 'onModalClose'> & {
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
                icons={<IoAdd />}
            >
                {_ts('project.detail.stakeholders', 'addButtonLabel')}
            </Button>
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
