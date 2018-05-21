import React from 'react';

import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';

import { handleException, handleReport } from '#config/sentry';
import _ts from '#ts';
import styles from './styles.scss';

export default class ComponentError extends React.PureComponent {
    static handleException = handleException;

    render() {
        const errorText = _ts('components.componentError', 'problemText');
        const reportErrorTitle = _ts('components.componentError', 'reportErrorTitle');

        return (
            <div className={styles.messageContainer}>
                { errorText }
                <PrimaryButton
                    // Use cloak for development
                    onClick={handleReport}
                    className={styles.button}
                >
                    {reportErrorTitle}
                </PrimaryButton>
            </div>
        );
    }
}
