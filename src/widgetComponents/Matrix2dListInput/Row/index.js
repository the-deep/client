import React from 'react';
import PropTypes from 'prop-types';

import MultiSelectInput from '#rsci/MultiSelectInput';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    dimension: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    subdimension: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sector: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    subsectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
};

const defaultProps = {
    subsectors: [],
    disabled: false,
};

export default class Row extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static subsectorKeySelector = d => d.id;
    static subsectorLabelSelector = d => d.title;

    handleChange = (subsectors) => {
        const {
            dimension: { id: dimensionId },
            subdimension: { id: subdimensionId },
            sector: { id: sectorId },
            onChange,
        } = this.props;

        onChange(dimensionId, subdimensionId, sectorId, subsectors);
    }

    render() {
        const {
            dimension,
            subdimension,
            sector,
            subsectors,
            disabled,
        } = this.props;

        return (
            <div className={styles.row}>
                <div className={styles.tagDimension} >
                    <div className={styles.dimensionTitle}>
                        {dimension.title}
                    </div>
                    <div className={styles.subdimensionTitle}>
                        {subdimension.title}
                    </div>
                </div>
                <div className={styles.tagSector}>
                    <div className={styles.title}>
                        {sector.title}
                    </div>
                    <MultiSelectInput
                        onChange={this.handleChange}
                        value={subsectors}
                        options={sector.subsectors}
                        keySelector={Row.subsectorKeySelector}
                        labelSelector={Row.subsectorLabelSelector}
                        placeholder={_ts('framework.matrix2dWidget', 'subsectorsLabel')}
                        label={_ts('framework.matrix2dWidget', 'subsectorsLabel')}
                        showHintAndError={false}
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }
}
