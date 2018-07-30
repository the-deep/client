import React from 'react';
import PropTypes from 'prop-types';

import List from '#rs/components/View/List';
import FaramElement from '#rs/components/Input/Faram/FaramElement';
import update from '#rsu/immutable-update';

import DimensionRow from './DimensionRow';
import styles from './styles.scss';


const SectorTitle = ({ title }) => (
    <th>
        {title}
    </th>
);
SectorTitle.propTypes = {
    title: PropTypes.string.isRequired,
};

const propTypes = {
    dimensions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    dimensions: [],
    sectors: [],
    value: undefined,
    disabled: false,
    onChange: () => {},
};

class Matrix2dInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = dimension => dimension.id;

    static titleKeyExtractor = sector => sector.id;

    handleCellClick = (dimensionId, subdimensionId, sectorId, isCellActive) => {
        const {
            value,
            onChange,
        } = this.props;

        const settings = { $auto: {
            [dimensionId]: { $auto: {
                [subdimensionId]: { $auto: {
                    $if: [
                        isCellActive,
                        { $unset: [sectorId] },
                        {
                            [sectorId]: { $set: [] },
                        },
                    ],
                } },
            } },
        } };

        const newValue = update(value, settings);
        onChange(newValue);
    }

    handleCellDrop = (dimensionId, subdimensionId, sectorId, droppedData) => {
        const { type, data } = droppedData;

        const faramInfo = {
            action: 'newEntry',
            excerptType: type,
            excerptValue: data,
            value: {
                [dimensionId]: {
                    [subdimensionId]: {
                        [sectorId]: [],
                    },
                },
            },
        };

        this.props.onChange(undefined, undefined, faramInfo);
    }

    titleRendererParams = (key, sector) => ({
        title: sector.title,
    })

    rendererParams = (key, dimension) => {
        const {
            dimensions, // eslint-disable-line no-unused-vars
            onChange, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        return {
            dimension,
            dimensionId: key,
            onClick: this.handleCellClick,
            onDrop: this.handleCellDrop,
            ...otherProps,
        };
    }

    render() {
        const {
            dimensions,
            sectors,
        } = this.props;

        return (
            <div className={styles.overview}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th />
                            <th />
                            <List
                                data={sectors}
                                keyExtractor={Matrix2dInput.titleKeyExtractor}
                                renderer={SectorTitle}
                                rendererParams={this.titleRendererParams}
                            />
                        </tr>
                    </thead>
                    <tbody>
                        <List
                            data={dimensions}
                            keyExtractor={Matrix2dInput.keyExtractor}
                            renderer={DimensionRow}
                            rendererParams={this.rendererParams}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}

export default FaramElement('input')(Matrix2dInput);
