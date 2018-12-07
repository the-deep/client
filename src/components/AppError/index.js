import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Message from '#rscv/Message';

import Cloak from '#components/Cloak';
import { handleException, handleReport } from '#config/sentry';
import _ts from '#ts';
import styles from './styles.scss';

export default class AppError extends React.PureComponent {
    static handleException = handleException;
    static shouldHideReport = ({ isDevMode }) => isDevMode;

    render() {
        const errorText = _ts('components.appError', 'problemText');
        const reportErrorTitle = _ts('components.appError', 'reportErrorTitle');

        return (
            <Message className={styles.messageContainer}>
                { errorText }
                <Cloak
                    hide={AppError.shouldHideReport}
                    render={
                        <PrimaryButton
                            onClick={handleReport}
                            className={styles.button}
                        >
                            {reportErrorTitle}
                        </PrimaryButton>
                    }
                />
            </Message>
        );
    }
}
