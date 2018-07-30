import React from 'react';
import PropTypes from 'prop-types';
import Numeral from '#rs/components/View/Numeral';
import FaramElement from '#rs/components/Input/Faram/FaramElement';
import { getColorOnBgColor } from '#rsu/common';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.number.isRequired,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    minColor: PropTypes.string.isRequired,
    maxColor: PropTypes.string.isRequired,
    title: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    title: '',
};

// TODO: move to utils
const parseColor = (color) => {
    let mm;
    let m;

    // Obviously, the numeric values will be easier to parse than names.So we do those first.
    mm = color.match(/^#?([0-9a-f]{3})$/i);
    if (mm) {
        m = mm[1];
        // in three-character format, each value is multiplied by 0x11 to give an
        // even scale from 0x00 to 0xff
        return {
            r: parseInt(m.charAt(0), 16) * 0x11,
            g: parseInt(m.charAt(1), 16) * 0x11,
            b: parseInt(m.charAt(2), 16) * 0x11,
        };
    }

    // That's one. Now for the full six-digit format:
    mm = color.match(/^#?([0-9a-f]{6})$/i);
    if (mm) {
        m = mm[1];
        return {
            r: parseInt(m.substr(0, 2), 16),
            g: parseInt(m.substr(2, 2), 16),
            b: parseInt(m.substr(4, 2), 16),
        };
    }

    // And now for rgb() format:
    mm = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (mm) {
        return {
            r: mm[1],
            g: mm[2],
            b: mm[3],
        };
    }

    return {};
};

class ScoreItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            value,
            title,
            minValue,
            maxValue,
            minColor,
            maxColor,
            className,
        } = this.props;

        const classNames = [
            className,
            styles.scoreItem,
        ];

        const scale = (value - minValue) / (maxValue - minValue);
        const invScale = 1 - scale;

        const rgbMinColor = parseColor(minColor);
        const rgbMaxColor = parseColor(maxColor);

        const mix = (minC, maxC) => (
            Math.round(((minC * invScale) + (maxC * scale)))
        );

        const c = {
            r: mix(rgbMinColor.r, rgbMaxColor.r).toString(16),
            g: mix(rgbMinColor.g, rgbMaxColor.g).toString(16),
            b: mix(rgbMinColor.b, rgbMaxColor.b).toString(16),
        };

        const backgroundColor = `#${c.r}${c.g}${c.b}`;
        const color = getColorOnBgColor(backgroundColor);

        return (
            <div
                className={classNames.join(' ')}
                style={{
                    color,
                    backgroundColor,
                }}
            >
                <Numeral
                    className={styles.number}
                    value={value}
                    precision={0}
                />
                <div className={styles.title}>
                    { title }
                </div>
            </div>
        );
    }
}

export default FaramElement('output')(ScoreItem);
