import React from 'react';
import { IoArrowForward } from 'react-icons/io5';
import { Button } from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import ChangePasswordModal, { Props as ChangePasswordModalProps } from '#newComponents/general/ChangePasswordModal';
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
        isShown,
        showModal,
        hideModal,
    ] = useModalState(false);

    return (
        <>
            <Button
                className={className}
                name={undefined}
                variant="secondary"
                onClick={showModal}
                disabled={disabled}
                actions={<IoArrowForward />}
            >
                {_ts('changePassword', 'title')}
            </Button>
            {isShown && (
                <ChangePasswordModal
                    {...stakeholderModalProps}
                    onModalClose={hideModal}
                />
            )}
        </>
    );
}

export default ChangePasswordButton;
