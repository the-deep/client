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

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
};

const defaultProps = {
    value: undefined,
    disabled: false,
    activeCellStyle: undefined,
};

export default class Cell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleClick = () => {
        const {
            dimensionId,
            subdimensionId,
            sectorId,
        } = this.props;
        this.props.onClick(dimensionId, subdimensionId, sectorId);
    }

    render() {
        const {
            activeCellStyle,
            disabled,
        } = this.props;
        const style = this.isCellActive() ? activeCellStyle : undefined;

        return (
            <td
                className={styles.cell}
                disabled={disabled}
                role="gridcell"
                style={style}
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}
                onClick={this.handleClick}
            />
        );
    }
}

