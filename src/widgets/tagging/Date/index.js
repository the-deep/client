import React from 'react';
// import PropTypes from 'prop-types';

import DateInput from '#rsci/DateInput';
import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class DateWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div className={styles.dateWidget}>
                <DateInput
                    faramElementName="value"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
