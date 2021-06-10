import React from 'react';

import { useModalState } from '#hooks/stateManagement';
import { IoArrowForward } from 'react-icons/io5';
import { Button } from '@the-deep/deep-ui';
import ChangePasswordModal, { Props as ChangePasswordModalProps } from '#components/general/ChangePasswordModal';
import _ts from '#ts';

type Props = Omit<ChangePasswordModalProps, 'onModalClose'> & {
    className?: string;
    disabled?: boolean;
}

function ChangePasswordButton(props: Props) {
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
                variant="secondary"
                onClick={toggleModalShow}
                disabled={disabled}
                actions={<IoArrowForward />}
            >
                {_ts('changePassword', 'title')}
            </Button>
            {showModal && (
                <ChangePasswordModal
                    {...stakeholderModalProps}
                    onModalClose={hideModal}
                />
            )}
        </>
    );
}

export default ChangePasswordButton;
