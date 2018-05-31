import React from 'react';
import Raven from 'raven-js';

import PrimaryButton from '#rs/components/Action/Button';

import _ts from '#ts';
import styles from './styles.scss';

export default class AppError extends React.PureComponent {
    getErrorText = () => _ts('components.appError', 'problemText')

    render() {
        const errorText = this.getErrorText();

        // FIXME: style
        return (
            <div className={styles.messageContainer}>
                { errorText }
                <PrimaryButton
                    // NOTE: Only works after Raven is initialized
                    onClick={() => Raven.lastEventId() && Raven.showReportDialog()}
                >
                    Report
                </PrimaryButton>
            </div>
        );
    }
}
