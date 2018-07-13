import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    dimensionId: PropTypes.string.isRequired,
    subdimensionId: PropTypes.string.isRequired,
    sectorId: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,

    activeCellStyle: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    hoverStyle: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
};

const defaultProps = {
    value: undefined,
    disabled: false,
    activeCellStyle: undefined,
    hoverStyle: undefined,
};

export default class Cell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { isBeingDraggedOver: false };
    }

    isCellActive = () => {
        const {
            value,

            dimensionId,
            subdimensionId,
            sectorId,
        } = this.props;
        const subsectors = value && ((value[dimensionId] || {})[subdimensionId] || {})[sectorId];

        return !!subsectors;
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
            dimensionId,
            subdimensionId,
            sectorId,
        } = this.props;

        const data = e.dataTransfer.getData('text');
        let formattedData;
        try {
            formattedData = JSON.parse(data);
        } catch (ex) {
            formattedData = {
                type: 'excerpt',
                data,
            };
        }
        this.props.onDrop(dimensionId, subdimensionId, sectorId, formattedData);
        this.setState({ isBeingDraggedOver: false });
    }

    handleClick = () => {
        const {
            dimensionId,
            subdimensionId,
            sectorId,
        } = this.props;
        const isCellActive = this.isCellActive();
        this.props.onClick(dimensionId, subdimensionId, sectorId, isCellActive);
    }

    render() {
        const {
            activeCellStyle,
            disabled,
            hoverStyle,
        } = this.props;
        const { isBeingDraggedOver } = this.state;

        let style = this.isCellActive() ? activeCellStyle : undefined;
        if (isBeingDraggedOver) {
            style = style ? { ...style, ...hoverStyle } : hoverStyle;
        }

        return (
            <td
                className={styles.cell}
                disabled={disabled}
                role="gridcell"
                style={style}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
                onClick={this.handleClick}
            />
        );
    }
}

