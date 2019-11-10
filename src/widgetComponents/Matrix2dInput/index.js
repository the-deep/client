import React from 'react';
import PropTypes from 'prop-types';
import { FaramInputElement } from '@togglecorp/faram';
import memoize from 'memoize-one';

import List from '#rscv/List';
import update from '#rsu/immutable-update';

import DimensionRow from './DimensionRow';
import styles from './styles.scss';


const SectorTitle = ({
    title,
    tooltip,
    fontSize,
}) => (
    <th
        title={tooltip}
        style={{ fontSize }}
    >
        {title}
    </th>
);

SectorTitle.propTypes = {
    title: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
};

SectorTitle.defaultProps = {
    tooltip: '',
};

const propTypes = {
    dimensions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    dimensions: [],
    sectors: [],
    value: undefined,
    onChange: () => {},
};

@FaramInputElement
export default class Matrix2dInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = dimension => dimension.id;

    static titleKeyExtractor = sector => sector.id;

    getHeadRowStyle = memoize(titleRowHeight => (
        titleRowHeight ? ({ height: `${titleRowHeight}px` }) : undefined
    ));

    getTitleColumnStyle = memoize(titleColumnWidth => (
        titleColumnWidth ? ({ width: `${titleColumnWidth}px` }) : undefined
    ));

    getSubTitleColumnStyle = memoize(subTitleColumnWidth => (
        subTitleColumnWidth ? ({ width: `${subTitleColumnWidth}px` }) : undefined
    ));

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

        this.props.onChange(undefined, faramInfo);
    }

    titleRendererParams = (key, sector) => ({
        title: sector.title,
        tooltip: sector.tooltip,
        fontSize: sector.fontSize ? `${sector.fontSize}px` : undefined,
    })

    dimensionRendererParams = (key, dimension) => {
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
            meta,
        } = this.props;


        const headRowStyle = this.getHeadRowStyle(dimensions.titleRowHeight);
        const titleColumnStyle = this.getTitleColumnStyle(sectors.titleColumnWidth);
        const subTitleColumnStyle = this.getSubTitleColumnStyle(sectors.subTitleColumnWidth);

        console.warn(meta);

        return (
            <div className={styles.overview}>
                <table className={styles.table}>
                    <thead>
                        <tr style={headRowStyle}>
                            <th style={titleColumnStyle} />
                            <th style={subTitleColumnStyle} />
                            <List
                                data={sectors}
                                keySelector={Matrix2dInput.titleKeyExtractor}
                                renderer={SectorTitle}
                                rendererParams={this.titleRendererParams}
                            />
                        </tr>
                    </thead>
                    <tbody>
                        <List
                            data={dimensions}
                            keySelector={Matrix2dInput.keySelector}
                            renderer={DimensionRow}
                            rendererParams={this.dimensionRendererParams}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}
