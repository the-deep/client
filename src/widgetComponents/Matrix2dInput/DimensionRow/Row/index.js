import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import { _cs } from '@togglecorp/fujs';

import List from '#rscv/List';

import Cell from './Cell';
import styles from './styles.scss';

const emptyList = [];

const propTypes = {
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    subdimension: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node,
    rowStyle: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    dimensionId: PropTypes.string,
    subdimensionId: PropTypes.string,
    activeSectorKey: PropTypes.string,
    activeCellStyle: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    activeSectorKey: undefined,
    children: undefined,
    subdimension: {},
    sectors: [],
    dimensionId: undefined,
    subdimensionId: undefined,
    value: undefined,
};

export default class SubdimensionRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = sector => sector.id;

    getCellStyle = memoize((fontSize, orientation, height) => {
        const tdStyle = {};
        let tdClassName;

        if (fontSize) {
            tdStyle.fontSize = `${fontSize}px`;
        }

        if (height) {
            tdStyle.height = `${height}px`;
        }

        if (orientation === 'bottomToTop') {
            tdClassName = styles.rotated;
        }

        return {
            tdClassName,
            tdStyle,
        };
    })

    getSubSectorsForActiveSector = memoize((sectors, activeSectorKey) => {
        if (!activeSectorKey) {
            return emptyList;
        }

        const activeSector = sectors
            .find(d => SubdimensionRow.keySelector(d) === activeSectorKey);

        if (!activeSector) {
            return emptyList;
        }

        return activeSector.subsectors;
    })

    isRowActive = () => {
        const {
            value,
            dimensionId,
            subdimensionId,
            activeSectorKey,
        } = this.props;

        if (!activeSectorKey) {
            return false;
        }

        if (!value) {
            return false;
        }
        const {
            [dimensionId]: {
                [subdimensionId]: subsectors,
            } = {},
        } = value;

        return subsectors && Object.keys(subsectors).length > 0;
    }

    rendererParams = (key) => {
        const {
            subdimension, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            sectors, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            rowStyle, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            children, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            activeSectorKey,
            ...otherProps
        } = this.props;

        const isSubsectorMode = !!activeSectorKey;

        return {
            isSubsectorMode,
            sectorId: isSubsectorMode ? activeSectorKey : key,
            subsectorId: isSubsectorMode ? key : undefined,
            ...otherProps,
        };
    }

    render() {
        const {
            subdimension,
            sectors,
            rowStyle,
            children,
            activeSectorKey,
            activeCellStyle,
            meta,
        } = this.props;

        const {
            fontSize,
            orientation,
            height,
            title,
            tooltip,
        } = subdimension;

        const {
            tdClassName,
            tdStyle,
        } = this.getCellStyle(
            fontSize || meta.subTitleColumnFontSize,
            (!orientation || orientation === 'default') ? meta.subTitleColumnOrientation : orientation,
            height,
        );

        const subdimensionStyle = this.isRowActive() ? ({
            ...activeCellStyle,
            ...tdStyle,
        }) : ({ tdStyle });

        return (
            <tr style={rowStyle}>
                { children }
                <td
                    title={tooltip}
                    style={tdStyle}
                    className={_cs(styles.subdimensionTd, tdClassName)}
                >
                    <div className={styles.subdimensionTitle}>
                        {title}
                    </div>
                </td>
                <List
                    data={
                        activeSectorKey ? this.getSubSectorsForActiveSector(
                            sectors,
                            activeSectorKey,
                        ) : sectors
                    }
                    keySelector={SubdimensionRow.keySelector}
                    renderer={Cell}
                    rendererParams={this.rendererParams}
                />
            </tr>
        );
    }
}

