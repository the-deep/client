import PropTypes from 'prop-types';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';
import React from 'react';

import Numeral from '#rscv/Numeral';
import HighlightableText from '#components/viewer/HighlightableTextOutput';

/*
eslint css-modules/no-unused-class: [
    1,
    {
        markAsUsed: [
            'normal', 'table', 'block', 'small-block', 'stretched'
        ],
        camelCase: true
    }
]
*/
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    valueClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
    iconLabel: PropTypes.bool,
    type: PropTypes.string,
    // NOTE: PropTypes.object below because TextOutput sometimes gets <DateOutput> as value
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    isNumericValue: PropTypes.bool,
    alwaysVisible: PropTypes.bool,
    searchValue: PropTypes.string,
    noColon: PropTypes.bool,
};

const defaultProps = {
    iconLabel: false,
    className: undefined,
    valueClassName: undefined,
    labelClassName: undefined,
    value: undefined,
    type: 'normal',
    isNumericValue: false,
    alwaysVisible: false,
    searchValue: undefined,
    noColon: false,
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
            labelClassName,
            iconLabel,
            isNumericValue,
            valueClassName,
            alwaysVisible,
            searchValue,
            noColon,
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
                {searchValue ? (
                    <HighlightableText
                        highlightText={searchValue}
                        text={value}
                    />
                ) : (
                    value
                )}
            </div>
        );

        return (
            <div className={
                _cs(
                    classNameFromProps,
                    styles[type],
                    noColon && styles.noColon,
                )}
            >
                { iconLabel ? (
                    <div className={_cs(
                        styles.iconLabel,
                        label,
                    )}
                    />
                ) : (
                    <div className={_cs(styles.label, labelClassName)}>
                        { label }
                    </div>
                )}
                {valueComponent}
            </div>
        );
    }
}
