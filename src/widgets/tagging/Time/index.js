import React from 'react';
// import PropTypes from 'prop-types';

import TimeInput from '#rsci/TimeInput';
import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class TimeWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div className={styles.time}>
                <TimeInput
                    faramElementName="value"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
