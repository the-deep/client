import React from 'react';
import PropTypes from 'prop-types';
import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';
import memoize from 'memoize-one';
import produce from 'immer';

import List from '#rscv/List';
import Icon from '#rscg/Icon';

import ColumnTitle from './ColumnTitle';
import SubcolumnTitle from './SubcolumnTitle';
import DimensionRow from './DimensionRow';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    dimensions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
    meta: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    dimensions: [],
    sectors: [],
    meta: {},
    value: {},
    onChange: () => {}, // FIXME: avoid use of noOp
};

const rowKeySelector = dimension => dimension.id;
const columnKeySelector = sector => sector.id;


@FaramInputElement
export default class Matrix2dInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;


    constructor(props) {
        super(props);

        this.state = {
            activeSectorKey: undefined,
        };
    }

    getHeadRowStyle = memoize(titleRowHeight => (
        titleRowHeight ? ({ height: `${titleRowHeight}px` }) : undefined
    ));

    getTitleColumnStyle = memoize(titleColumnWidth => (
        titleColumnWidth ? ({ width: `${titleColumnWidth}px` }) : undefined
    ));

    getSubTitleColumnStyle = memoize(subTitleColumnWidth => (
        subTitleColumnWidth ? ({ width: `${subTitleColumnWidth}px` }) : undefined
    ));

    getActiveSector = memoize((sectors, activeSectorKey) => (
        sectors.find(d => columnKeySelector(d) === activeSectorKey)
    ))

    handleCellClick = (dimensionId, subdimensionId, sectorId, subsectorId, isCellActive) => {
        const {
            value,
            onChange,
        } = this.props;

        const isSubsectorMode = !!subsectorId;

        const newValue = produce(value, (safeValue) => {
            if (!safeValue[dimensionId]) {
                // eslint-disable-next-line no-param-reassign
                safeValue[dimensionId] = {};
            }
            if (!safeValue[dimensionId][subdimensionId]) {
                // eslint-disable-next-line no-param-reassign
                safeValue[dimensionId][subdimensionId] = {};
            }

            if (!isSubsectorMode) {
                if (isCellActive) {
                    // eslint-disable-next-line no-param-reassign
                    delete safeValue[dimensionId][subdimensionId][sectorId];
                } else {
                    // eslint-disable-next-line no-param-reassign
                    safeValue[dimensionId][subdimensionId][sectorId] = [];
                }
            } else {
                // eslint-disable-next-line no-lonely-if
                if (isCellActive) {
                    const index = safeValue[dimensionId][subdimensionId][sectorId].findIndex(
                        item => item === subsectorId,
                    );
                    safeValue[dimensionId][subdimensionId][sectorId].splice(index, 1);
                } else {
                    if (!safeValue[dimensionId][subdimensionId][sectorId]) {
                        // eslint-disable-next-line no-param-reassign
                        safeValue[dimensionId][subdimensionId][sectorId] = [];
                    }
                    // eslint-disable-next-line no-param-reassign
                    safeValue[dimensionId][subdimensionId][sectorId].push(subsectorId);
                }
            }
        });

        onChange(newValue);
    }

    handleCellDrop = (dimensionId, subdimensionId, sectorId, subsectorId, droppedData) => {
        const { type, data } = droppedData;

        const faramInfo = {
            action: 'newEntry',
            excerptType: type,
            excerptValue: data,
            value: {
                [dimensionId]: {
                    [subdimensionId]: {
                        [sectorId]: subsectorId ? [subsectorId] : [],
                    },
                },
            },
        };

        this.props.onChange(undefined, faramInfo);
    }

    columTitleRendererParams = (key, sector) => {
        const { meta } = this.props;
        const clickable = sector.subsectors && sector.subsectors.length;

        return {
            title: sector.title,
            tooltip: sector.tooltip,
            fontSize: sector.fontSize || meta.titleRowFontSize,
            width: sector.width || meta.titleRowFontSize,
            orientation: (!sector.orientation || sector.orientation === 'default') ?
                meta.titleRowOrientation : sector.orientation,
            sectorKey: key,
            clickable,
            onClick: clickable ? this.handleSectorTitleClick : undefined,
        };
    }

    subsectorTitleRendererParams = (key, subsector) => ({
        title: subsector.title,
        tooltip: subsector.tooltip,

        fontSize: subsector.fontSize,
        width: subsector.width,
        orientation: subsector.orientation,
    });

    handleActiveSectorTitleClick = () => {
        this.setState({ activeSectorKey: undefined });
    }

    handleSectorTitleClick = (sectorKey) => {
        this.setState({ activeSectorKey: sectorKey });
    }

    dimensionRowRendererParams = (key, dimension) => {
        const {
            dimensions, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherProps
        } = this.props;

        const { activeSectorKey } = this.state;

        return {
            activeSectorKey,
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
            className,
        } = this.props;

        const { activeSectorKey } = this.state;

        const headRowStyle = this.getHeadRowStyle(meta.titleRowHeight);
        const titleColumnStyle = this.getTitleColumnStyle(meta.titleColumnWidth);
        const subTitleColumnStyle = this.getSubTitleColumnStyle(meta.subTitleColumnWidth);

        const activeSector = this.getActiveSector(sectors, activeSectorKey);
        const subsectors = activeSector ? activeSector.subsectors : [];

        return (
            <div className={_cs(className, styles.matrixTwoDInput)}>
                <table className={styles.table}>
                    { activeSectorKey ? (
                        <thead>
                            <tr>
                                <th
                                    onClick={this.handleActiveSectorTitleClick}
                                    colSpan={subsectors.length + 2}
                                    className={styles.activeSectorHeader}
                                >
                                    <Icon
                                        className={styles.backIcon}
                                        name="back"
                                    />
                                    { activeSector.title }
                                </th>
                            </tr>
                            <tr style={headRowStyle}>
                                <th style={titleColumnStyle}>
                                    <div className={styles.hidden}>
                                        -
                                    </div>
                                </th>
                                <th style={subTitleColumnStyle}>
                                    <div className={styles.hidden}>
                                        -
                                    </div>
                                </th>
                                <List
                                    data={subsectors}
                                    keySelector={columnKeySelector}
                                    renderer={SubcolumnTitle}
                                    rendererParams={this.subsectorTitleRendererParams}
                                />
                            </tr>
                        </thead>
                    ) : (
                        <thead>
                            <tr>
                                <th
                                    className={styles.topTh}
                                    colSpan={sectors.length + 2}
                                >
                                    <div className={styles.hidden}>
                                        -
                                    </div>
                                </th>
                            </tr>
                            <tr style={headRowStyle}>
                                <th style={titleColumnStyle}>
                                    <div className={styles.hidden}>
                                        -
                                    </div>
                                </th>
                                <th style={subTitleColumnStyle}>
                                    <div className={styles.hidden}>
                                        -
                                    </div>
                                </th>
                                <List
                                    data={sectors}
                                    keySelector={columnKeySelector}
                                    renderer={ColumnTitle}
                                    rendererParams={this.columTitleRendererParams}
                                />
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        <List
                            data={dimensions}
                            keySelector={rowKeySelector}
                            renderer={DimensionRow}
                            rendererParams={this.dimensionRowRendererParams}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}
