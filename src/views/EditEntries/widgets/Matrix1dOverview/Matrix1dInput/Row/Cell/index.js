import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    active: PropTypes.bool,
    onClick: PropTypes.func,
    onDrop: PropTypes.func,
    disabled: PropTypes.bool,
};

const defaultProps = {
    children: undefined,
    active: false,
    onClick: undefined,
    onDrop: () => {},
    disabled: false,
};

export default class Matrix1dCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { isBeingDraggedOver: false };
    }

    getClassName = () => {
        const classNames = [];
        classNames.push(styles.matrixCell);

        const { active } = this.props;
        if (active) {
            classNames.push(styles.active);
        }
        const { isBeingDraggedOver } = this.state;
        if (isBeingDraggedOver) {
            classNames.push(styles.isBeingDraggedOver);
        }

        return classNames.join(' ');
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
        } = this.props;

        return (
            <button
                className={this.getClassName()}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
                onClick={onClick}
                type="button"
                tabIndex="-1"
                disabled={disabled}
            >
                { children }
            </button>
        );
    }
}
