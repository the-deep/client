import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import LoginRegisterModal from './LoginRegisterModal';
import styles from './styles.scss';

interface Props {
    className?: string;
}

function ExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const [
        isLoginModalShown,
        showLoginModal,
        hideLoginModal,
    ] = useModalState(true);

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
                />
            )}
        </div>
    );
}

export default ExploreDeep;
