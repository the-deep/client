import PropTypes from 'prop-types';
import React from 'react';

import {
    _cs,
    getColorOnBgColor,
} from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    content: PropTypes.node,
    active: PropTypes.bool,
    itemKey: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    onDrop: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    tooltip: PropTypes.string,
    className: PropTypes.string,
    contentClassName: PropTypes.string,
    color: PropTypes.string.isRequired,
};

const defaultProps = {
    tooltip: '',
    content: undefined,
    active: false,
    onClick: undefined,
    onDrop: () => {},
    disabled: false,
    readOnly: false,
    className: undefined,
    contentClassName: undefined,
};

export default class Matrix1dCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { isBeingDraggedOver: false };
    }

    handleDragEnter = () => {
        this.setState({ isBeingDraggedOver: true });
    }

    handleDragExit = () => {
        this.setState({ isBeingDraggedOver: false });
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.preventDefault();
        const {
            onDrop,
            itemKey,
        } = this.props;

        const data = e.dataTransfer.getData('text');
        try {
            const parsedData = JSON.parse(data);
            onDrop(itemKey, parsedData);
        } catch (ex) {
            const formattedData = {
                type: 'excerpt',
                data,
            };
            onDrop(itemKey, formattedData);
        }

        this.setState({ isBeingDraggedOver: false });
    }

    handleButtonClick = () => {
        const {
            itemKey,
            onClick,
        } = this.props;

        if (onClick) {
            onClick(itemKey);
        }
    }


    render() {
        const {
            content,
            disabled,
            readOnly,
            active,
            tooltip,
            className: classNameFromProps,
            contentClassName,
            color,
        } = this.props;

        const fgColor = getColorOnBgColor(
            color,
            'var(--color-text-on-light)',
            'var(--color-text-on-dark)',
        );

        const { isBeingDraggedOver } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.matrixCell,
            active && styles.active,
            isBeingDraggedOver && styles.isBeingDraggedOver,
        );

        return (
            <button
                className={className}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
                onClick={this.handleButtonClick}
                type="button"
                tabIndex="-1"
                title={tooltip}
                disabled={disabled || readOnly}
                style={{
                    outlineColor: active ? fgColor : 'transparent',
                    color: fgColor,
                    backgroundColor: color,
                }}
            >
                <div className={_cs(contentClassName)}>
                    { content }
                </div>
            </button>
        );
    }
}
