import PropTypes from 'prop-types';
import React from 'react';

import { getRgbFromHex } from '#rsu/common';

import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    highlight: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onClick: PropTypes.func,
    actualStr: PropTypes.string.isRequired,
    highlightKey: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    onClick: () => {},
    className: '',
};

export default class Highlight extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getHighlightColors = (color) => {
        const { r, g, b } = getRgbFromHex(color);

        const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
        const borderColor = color;
        const labelColor = `rgba(${r}, ${g}, ${b}, 0.5)`;

        return {
            background: backgroundColor,
            border: borderColor,
            label: labelColor,
        };
    };

    handleClick = (e) => {
        const {
            highlight,
            onClick,
            actualStr,
            highlightKey,
        } = this.props;
        onClick(
            e,
            {
                ...highlight,
                text: actualStr,
                key: highlightKey,
            },
        );
        e.stopPropagation();
    }

    handleDrag = (e) => {
        const { actualStr } = this.props;
        e.dataTransfer.setData('text/plain', actualStr);
        e.stopPropagation();
    };

    render() {
        const {
            highlight: {
                label,
                color,
                details,
            },
            text,
            className: classNameFromProps,
        } = this.props;

        const colors = Highlight.getHighlightColors(color);

        const style = {
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
        };

        const labelStyle = {
            backgroundColor: colors.label,
        };

        const className = _cs(
            styles.highlight,
            classNameFromProps,
        );

        return (
            <span
                className={className}
                role="presentation"
                style={style}
                onClick={this.handleClick}
                onDragStart={this.handleDrag}
                draggable
                title={details}
            >
                <span className={styles.text}>
                    {text}
                </span>
                {
                    label &&
                    <span
                        className={styles.label}
                        style={labelStyle}
                    >
                        { label }
                    </span>
                }
            </span>
        );
    }
}
