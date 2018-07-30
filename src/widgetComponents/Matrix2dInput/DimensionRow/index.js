import React from 'react';
import PropTypes from 'prop-types';

import List from '#rs/components/View/List';
import {
    getColorOnBgColor,
    hexToRgb,
    rgbToHex,
    interpolateRgb,
} from '#rsu/common';

import SubdimensionRow from './SubdimensionRow';
import styles from './styles.scss';

const propTypes = {
    dimension: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    dimensionId: PropTypes.string.isRequired,
};

const defaultProps = {
    dimension: {},
};

export default class DimensionRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = subdimension => subdimension.id;

    // TODO: memoize this function
    static getRowStyle = color => ({
        backgroundColor: color,
        color: getColorOnBgColor(color),
    });

    // TODO: memoize this function
    static getActiveCellStyle = (rowStyle) => {
        const outlineWidth = 2;

        const stripeWidth = 4;
        const firstColor = rowStyle.backgroundColor;
        const secondColor = rgbToHex(interpolateRgb(
            hexToRgb(rowStyle.backgroundColor),
            hexToRgb(rowStyle.color),
            0.4,
        ));

        return {
            outline: `${outlineWidth}px solid ${firstColor}`,
            outlineOffset: `-${outlineWidth + 1}px`,
            background: `repeating-linear-gradient(
                -45deg,
                ${firstColor},
                ${firstColor} ${stripeWidth}px,
                ${secondColor} ${stripeWidth}px,
                ${secondColor} ${stripeWidth * 2}px
            )`,
        };
    };

    static getHoverStyle = rowStyle => ({
        outline: `1px dashed ${rowStyle.color}`,
        outlineOffset: '-3px',
    });

    constructor(props) {
        super(props);

        const { dimension: { color } } = this.props;
        this.rowStyle = DimensionRow.getRowStyle(color);
        this.activeCellStyle = DimensionRow.getActiveCellStyle(this.rowStyle);
        this.hoverStyle = DimensionRow.getHoverStyle(this.rowStyle);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dimension.color !== nextProps.dimension.color) {
            this.rowStyle = DimensionRow.getRowStyle(nextProps.dimension.color);
            this.activeCellStyle = DimensionRow.getActiveCellStyle(this.rowStyle);
            this.hoverStyle = DimensionRow.getHoverStyle(this.rowStyle);
        }
    }

    rendererParams = (key, subdimension, i) => {
        const {
            dimension: {
                subdimensions,
                tooltip,
                title,
            },
            ...otherProps
        } = this.props;

        const isFirstSubdimension = i === 0;
        const children = isFirstSubdimension ? (
            <td
                rowSpan={subdimensions.length}
                className={styles.dimensionTd}
                title={tooltip}
            >
                {title}
            </td>
        ) : undefined;

        return {
            subdimension,
            subdimensionId: key,

            children,
            rowStyle: this.rowStyle,
            activeCellStyle: this.activeCellStyle,
            hoverStyle: this.hoverStyle,

            ...otherProps,
        };
    }

    render() {
        const { dimension: { subdimensions } } = this.props;
        return (
            <List
                data={subdimensions}
                keyExtractor={DimensionRow.keyExtractor}
                renderer={SubdimensionRow}
                rendererParams={this.rendererParams}
            />
        );
    }
}
