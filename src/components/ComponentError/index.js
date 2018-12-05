import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Message from '#rscv/Message';

import Cloak from '#components/Cloak';
import { handleException, handleReport } from '#config/sentry';
import _ts from '#ts';
import styles from './styles.scss';

export default class ComponentError extends React.PureComponent {
    static handleException = handleException;
    static shouldHideReport = ({ isDevMode }) => isDevMode;

    render() {
        const errorText = _ts('components.componentError', 'problemText');
        const reportErrorTitle = _ts('components.componentError', 'reportErrorTitle');

        return (
            <Message className={styles.messageContainer}>
                { errorText }
                <Cloak
                    hide={ComponentError.shouldHideReport}
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
