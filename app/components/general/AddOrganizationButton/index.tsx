import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { Button } from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import AddOrganizationModal, { Props as AddOrganizationModalProps } from '#components/general/AddOrganizationModal';
import _ts from '#ts';

type Props = Omit<AddOrganizationModalProps, 'onModalClose'> & {
    className?: string;
    disabled?: boolean;
}

function AddOrganizationButton(props: Props) {
    const {
        className,
        disabled,
        ...otherProps
    } = props;

    const [
        showModal,,
        hideModal,,
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
                {_ts('project.detail.stakeholders', 'addNewOrganizationTitle')}
            </Button>
            {showModal && (
                <AddOrganizationModal
                    {...otherProps}
                    onModalClose={hideModal}
                />
            )}
        </>
    );
}

export default AddOrganizationButton;
