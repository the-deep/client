import React from 'react';
import PropTypes from 'prop-types';

import { FaramInputElement } from '#rscg/FaramElements';
import ListView from '#rscv/List/ListView';
import update from '#rsu/immutable-update';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    dimensions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    dimensions: [],
    sectors: [],
    value: undefined,
    disabled: false,
    readOnly: false,
    onChange: () => {},
};

const getSelectedSectors = (dimensions = [], sectors = [], value) => {
    const selectedSectors = [];

    if (!value) {
        return selectedSectors;
    }

    dimensions.forEach((dimension) => {
        const dimensionAttribute = value[dimension.id];
        if (!dimensionAttribute) {
            return;
        }

        dimension.subdimensions.forEach((subdimension) => {
            const subdimensionAttribute = dimensionAttribute[subdimension.id];
            if (!subdimensionAttribute) {
                return;
            }

            sectors.forEach((sector) => {
                const sectorAttribute = subdimensionAttribute[sector.id];
                if (!sectorAttribute) {
                    return;
                }

                selectedSectors.push({
                    key: `${sector.id}-${dimension.id}-${subdimension.id}`,
                    dimension,
                    subdimension,
                    sector,
                    subsectors: sectorAttribute,
                });
            });
        });
    });
    return selectedSectors;
};

@FaramInputElement
export default class Matrix2dListInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    handleChange = (dimensionId, subdimensionId, sectorId, subsectors) => {
        const {
            value,
            onChange,
        } = this.props;

        const settings = { $auto: {
            [dimensionId]: { $auto: {
                [subdimensionId]: { $auto: {
                    [sectorId]: { $set: subsectors },
                } },
            } },
        } };

        const newValue = update(value, settings);
        onChange(newValue);
    }

    rendererParams = (key, row) => ({
        dimension: row.dimension,
        subdimension: row.subdimension,
        sector: row.sector,
        subsectors: row.subsectors,
        disabled: this.props.disabled,
        readOnly: this.props.readOnly,
        onChange: this.handleChange,
    })

    render() {
        const {
            dimensions,
            sectors,
            className: classNameFromProps,
            value,
        } = this.props;

        const data = getSelectedSectors(dimensions, sectors, value);
        const className = `
            ${classNameFromProps}
            ${styles.list}
        `;

        return (
            <ListView
                className={className}
                data={data}
                renderer={Row}
                rendererParams={this.rendererParams}
                keySelector={Matrix2dListInput.rowKeyExtractor}
                emptyComponent={null}
            />
        );
    }
}
