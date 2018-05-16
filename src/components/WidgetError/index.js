import React from 'react';

import _ts from '../../ts';
import styles from './styles.scss';

export default class WidgetError extends React.PureComponent {
    getErrorText = () => _ts('components.widgetError', 'problemText')

    render() {
        const errorText = this.getErrorText();

        return (
            <div className={styles.messageContainer}>
                { errorText }
            </div>
        );
    }
}
