import PropTypes from 'prop-types';
import React from 'react';

import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    active: PropTypes.bool,
    onClick: PropTypes.func,
    onDrop: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    children: undefined,
    active: false,
    onClick: undefined,
    onDrop: () => {},
    disabled: false,
    readOnly: false,
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
        const { onDrop } = this.props;

        const data = e.dataTransfer.getData('text');
        try {
            const parsedData = JSON.parse(data);
            onDrop(parsedData);
        } catch (ex) {
            const formattedData = {
                type: 'excerpt',
                data,
            };
            onDrop(formattedData);
        }

        this.setState({ isBeingDraggedOver: false });
    }

    render() {
        const {
            children,
            onClick,
            disabled,
            readOnly,
            active,
        } = this.props;

        const { isBeingDraggedOver } = this.state;

        const className = _cs(
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
                onClick={onClick}
                type="button"
                tabIndex="-1"
                disabled={disabled || readOnly}
            >
                { children }
            </button>
        );
    }
}
