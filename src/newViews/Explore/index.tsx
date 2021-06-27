import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import LoginRegisterModal from './LoginRegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import styles from './styles.scss';

interface Props {
    className?: string;
}

function ExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const [userEmail, setUserEmail] = useState<string | undefined>();

    const [
        isLoginModalShown,
        showLoginModal,
        hideLoginModal,
    ] = useModalState(true);

    const [
        isForgotModalShown,
        showForgotPasswordModal,
        hideForgotPasswordModal,
    ] = useModalState(false);

    const handleForgotPasswordClick = useCallback((selectedUserEmail?: string) => {
        hideLoginModal();
        showForgotPasswordModal();
        setUserEmail(selectedUserEmail);
    }, [hideLoginModal, showForgotPasswordModal]);

    return (
        <div className={_cs(styles.exploreDeep, className)}>
            <Button
                name="login"
                onClick={showLoginModal}
            >
                {_ts('explore', 'loginButtonLabel')}
            </Button>
            {isLoginModalShown && (
                <LoginRegisterModal
                    onClose={hideLoginModal}
                    onForgotPasswordClick={handleForgotPasswordClick}
                />
            )}
            {isForgotModalShown && (
                <ForgotPasswordModal
                    email={userEmail}
                    onClose={hideForgotPasswordModal}
                />
            )}
        </div>
    );
}

export default ExploreDeep;
