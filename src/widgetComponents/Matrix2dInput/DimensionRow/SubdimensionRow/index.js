import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import List from '#rscv/List';

import Cell from './Cell';

const emptyList = [];

const propTypes = {
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    subdimension: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node,
    rowStyle: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    children: undefined,
    subdimension: {},
    sectors: [],
};

export default class SubdimensionRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = sector => sector.id;

    getCellStyle = memoize((fontSize, orientation, height) => {
        const style = {};
        const tdStyle = {};

        if (fontSize) {
            style.fontSize = `${fontSize}px`;
        }

        if (orientation === 'bottomToTop') {
            style.writingMode = 'vertical-rl';
            tdStyle.width = 0;
            tdStyle.height = 0;
            style.transform = 'rotate(180deg)';
            style.width = '100%';
            style.height = '100%';
            style.display = 'flex';
            style.alignItems = 'center';
            style.justifyContent = 'center';
        } else {
            style.display = 'flex';
            style.alignItems = 'center';
            style.justifyContent = 'center';
        }

        if (height) {
            style.height = `${height}px`;
        }

        return {
            style,
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
            sectorId,
            activeSectorKey,
        } = this.props;

        if (!activeSectorKey) {
            return false;
        }

        const subsectors = value && ((value[dimensionId] || {})[subdimensionId]);
        return !!subsectors;
    }

    rendererParams = (key) => {
        const {
            subdimension, // eslint-disable-line no-unused-vars
            sectors, // eslint-disable-line no-unused-vars
            rowStyle, // eslint-disable-line no-unused-vars
            children, // eslint-disable-line no-unused-vars
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
        } = this.props;

        const {
            fontSize,
            orientation,
            height,
            title,
            tooltip,
        } = subdimension;

        const {
            style,
            tdStyle,
        } = this.getCellStyle(fontSize, orientation, height);

        const subdimensionStyle = this.isRowActive() ? ({
            ...this.props.activeCellStyle,
            ...tdStyle,
        }) : ({ tdStyle });

        return (
            <tr style={rowStyle}>
                { children }
                <td
                    title={tooltip}
                    style={subdimensionStyle}
                >
                    <div style={style}>
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

