import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

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
        const { className } = this.props;

        const separatorText = ' ';
        const invalidText = '';

        return (
            <div className={_cs(styles.numberOutput, className)} >
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
