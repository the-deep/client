import PropTypes from 'prop-types';
import React from 'react';

import _cs from '#cs';
import styles from './styles.scss';

export default class StringCell extends React.PureComponent {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        className: PropTypes.string,
        invalid: PropTypes.bool,
        empty: PropTypes.bool,
    };

    static defaultProps = {
        value: '',
        className: '',
        invalid: false,
        empty: false,
    };

    render() {
        const { value, className, invalid, empty } = this.props;
        return (
            <div className={_cs(className, invalid && styles.invalid, empty && styles.empty)}>
                { value }
            </div>
        );
    }
}
