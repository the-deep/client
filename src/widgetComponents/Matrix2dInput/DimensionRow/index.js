import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import {
    getColorOnBgColor,
    getRgbRawFromHex,
    getHexFromRgbRaw,
    interpolateRgb,
    _cs,
} from '@togglecorp/fujs';

import List from '#rscv/List';
import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    dimension: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    dimensionId: PropTypes.string.isRequired,
    meta: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

        const stripeWidth = 3;
        const firstColor = rowStyle.backgroundColor;
        const secondColor = getHexFromRgbRaw(
            interpolateRgb(
                getRgbRawFromHex(rowStyle.backgroundColor),
                getRgbRawFromHex(rowStyle.color),
                0.3,
            ),
        );

        const textBorderColor = firstColor;
        return {
            textShadow: `-1px 0 ${textBorderColor}, 0 1px ${textBorderColor}, 1px 0 ${textBorderColor}, 0 -1px ${textBorderColor}`,
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
        const tdStyle = {};
        let tdClassName;

        if (fontSize) {
            tdStyle.fontSize = `${fontSize}px`;
        }

        if (height) {
            tdStyle.height = `${height}px`;
        }

        if (orientation === 'bottomToTop') {
            tdClassName = styles.rotated;
        }

        return {
            tdClassName,
            tdStyle,
        };
    })

    rendererParams = (key, subdimension, i) => {
        const {
            meta,
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
                tdStyle,
                tdClassName,
            } = this.getCellStyle(
                fontSize || meta.titleColumnFontSize,
                (!orientation || orientation === 'default') ? meta.titleColumnOrientation : orientation,
                height,
            );

            children = (
                <td
                    rowSpan={subdimensions.length}
                    className={_cs(styles.dimensionTd, tdClassName)}
                    style={tdStyle}
                    title={tooltip}
                >
                    <div className={styles.dimensionTitle}>
                        {title}
                    </div>
                </td>
            );
        }

        return {
            meta,
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
                renderer={Row}
                rendererParams={this.rendererParams}
            />
        );
    }
}
