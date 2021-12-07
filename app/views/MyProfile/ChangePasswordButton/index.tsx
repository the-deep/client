import React, { useContext, useCallback } from 'react';
import { IoArrowForward } from 'react-icons/io5';
import { Button } from '@the-deep/deep-ui';

import { UserContext } from '#base/context/UserContext';
import { useModalState } from '#hooks/stateManagement';
import ChangePasswordModal, { Props as ChangePasswordModalProps } from '../ChangePasswordModal';
import _ts from '#ts';

type Props = Omit<ChangePasswordModalProps, 'onModalClose'> & {
    className?: string;
    disabled?: boolean;
}

function ChangePasswordButton(props: Props) {
    const {
        className,
        disabled,
        ...modalProps
    } = props;

    const {
        setUser,
    } = useContext(UserContext);

    const [
        isShown,
        showModal,
        hideModal,
    ] = useModalState(false);

    const handleSuccess = useCallback(() => {
        hideModal();
        setUser(undefined);
    }, [hideModal, setUser]);

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
                    {...modalProps}
                    onSuccess={handleSuccess}
                    onModalClose={hideModal}
                />
            )}
        </>
    );
}

export default ChangePasswordButton;
