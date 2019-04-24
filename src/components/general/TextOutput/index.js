import PropTypes from 'prop-types';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';
import React from 'react';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    valueClassName: PropTypes.string,
    label: PropTypes.string.isRequired,
    iconLabel: PropTypes.bool,
    type: PropTypes.string,
    // NOTE: PropTypes.object below because TextOutput sometimes gets <DateOutput> as value
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    isNumericValue: PropTypes.bool,
    alwaysVisible: PropTypes.bool,
};

const defaultProps = {
    iconLabel: false,
    className: '',
    valueClassName: '',
    value: undefined,
    type: 'normal',
    isNumericValue: false,
    alwaysVisible: false,
};

export default class TextOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            label,
            value,
            type,
            iconLabel,
            isNumericValue,
            valueClassName,
            alwaysVisible,
            ...otherProps
        } = this.props;

        if (isFalsy(value) && !alwaysVisible) {
            return null;
        }

        const valueComponent = isNumericValue ? (
            <Numeral
                className={_cs(styles.value, valueClassName)}
                value={value}
                precision={0}
                {...otherProps}
            />
        ) : (
            <div className={_cs(styles.value, valueClassName)}>
                { value }
            </div>
        );

        return (
            <div className={
                _cs(
                    classNameFromProps,
                    styles[type],
                )}
            >
                { iconLabel ? (
                    <div className={_cs(
                        styles.iconLabel,
                        label,
                    )}
                    />
                ) : (
                    <div className={styles.label}>
                        { label }
                    </div>
                )}
                {valueComponent}
            </div>
        );
    }
}
