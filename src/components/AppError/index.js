import React from 'react';

import PrimaryButton from '#rs/components/Action/Button';

import { handleException, handleReport } from '#config/sentry';
import _ts from '#ts';
import styles from './styles.scss';

export default class AppError extends React.PureComponent {
    static handleException = handleException;

    render() {
        const errorText = _ts('components.appError', 'problemText');

        return (
            <div className={styles.messageContainer}>
                { errorText }
                <PrimaryButton
                    // FIXME: style
                    // FIXME: Use cloak for development mode
                    onClick={handleReport}
                >
                    Report problem
                </PrimaryButton>
            </div>
        );
    }
}
