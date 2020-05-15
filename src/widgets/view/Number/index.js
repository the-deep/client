import React from 'react';
import PropTypes from 'prop-types';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class NumberListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
        } = this.props;

        const separatorText = ' ';
        const invalidText = '';

        const className = `
            ${classNameFromProps}
            ${styles.numberOutput}
        `;

        return (
            <div className={className} >
                <Numeral
                    faramElementName="value"
                    separator={separatorText}
                    invalidText={invalidText}
                    showThousandSeparator
                    precision={null}
                />
            </div>
        );
    }
}
