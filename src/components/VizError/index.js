import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import { handleException, handleReport } from '#config/sentry';
import _ts from '#ts';
import styles from './styles.scss';

export default class VizError extends React.PureComponent {
    static handleException = handleException;

    render() {
        const errorText = _ts('components.vizError', 'problemText');
        const reportErrorTitle = _ts('components.vizError', 'reportErrorTitle');

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
