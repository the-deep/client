import PropTypes from 'prop-types';
import React from 'react';

import _cs from '#cs';
import styles from './styles.scss';

export default class StringCell extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string,
        className: PropTypes.string,
        invalid: PropTypes.bool,
    };

    static defaultProps = {
        value: '',
        className: '',
        invalid: false,
    };

    render() {
        const { value, className, invalid } = this.props;
        return (
            <div className={_cs(className, invalid && styles.invalid)}>
                { value }
            </div>
        );
    }
}
