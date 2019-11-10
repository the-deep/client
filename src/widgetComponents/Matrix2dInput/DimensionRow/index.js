import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import List from '#rscv/List';
import {
    getColorOnBgColor,
    getRgbRawFromHex,
    getHexFromRgbRaw,
    interpolateRgb,
} from '@togglecorp/fujs';

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

    static keySelector = subdimension => subdimension.id;

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
        const secondColor = getHexFromRgbRaw(
            interpolateRgb(
                getRgbRawFromHex(rowStyle.backgroundColor),
                getRgbRawFromHex(rowStyle.color),
                0.4,
            ),
        );

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

        const { dimension: { color = '#ffffff' } } = this.props;
        this.rowStyle = DimensionRow.getRowStyle(color);
        this.activeCellStyle = DimensionRow.getActiveCellStyle(this.rowStyle);
        this.hoverStyle = DimensionRow.getHoverStyle(this.rowStyle);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dimension.color !== nextProps.dimension.color) {
            this.rowStyle = DimensionRow.getRowStyle(nextProps.dimension.color || '#ffffff');
            this.activeCellStyle = DimensionRow.getActiveCellStyle(this.rowStyle);
            this.hoverStyle = DimensionRow.getHoverStyle(this.rowStyle);
        }
    }

    getCellStyle = memoize((fontSize, orientation, height) => {
        const style = {};
        const tdStyle = {};

        if (fontSize) {
            style.fontSize = `${fontSize}px`;
        }

        if (orientation === 'bottomToTop') {
            style.writingMode = 'vertical-rl';
            tdStyle.width = 0;
            tdStyle.height = 0;
            style.transform = 'rotate(180deg)';
            style.width = '100%';
            style.height = '100%';
            style.display = 'flex';
            style.alignItems = 'center';
            style.justifyContent = 'center';
        } else {
            style.display = 'flex';
            style.alignItems = 'center';
        }

        if (height) {
            style.height = `${height}px`;
        }

        return {
            style,
            tdStyle,
        };
    })

    rendererParams = (key, subdimension, i) => {
        const {
            dimension: {
                subdimensions,
                tooltip,
                title,
                fontSize,
                orientation,
                height,
            },
            ...otherProps
        } = this.props;

        const isFirstSubdimension = i === 0;
        let children;

        if (isFirstSubdimension) {
            const {
                style,
                tdStyle,
            } = this.getCellStyle(fontSize, orientation, height);

            children = (
                <td
                    rowSpan={subdimensions.length}
                    className={styles.dimensionTd}
                    style={tdStyle}
                    title={tooltip}
                >
                    <div style={style}>
                        {title}
                    </div>
                </td>
            );
        }

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
                keySelector={DimensionRow.keySelector}
                renderer={SubdimensionRow}
                rendererParams={this.rendererParams}
            />
        );
    }
}
