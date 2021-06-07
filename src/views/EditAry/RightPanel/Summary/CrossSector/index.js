import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FaramGroup } from '@togglecorp/faram';
import SelectInput from '#rsci/SelectInput';
import HiearchicalSelectInput from '#rsci/HierarchicalSelectInput';

import {
    editArySelectedSectorsSelector,
    affectedGroupsSelector,
    prioritySectorsSelector,
    specificNeedGroupsSelector,
} from '#redux';

import {
    MIN_SECTORS_SELECTION_FOR_CROSS_SECTOR,
} from '#entities/editAry';

import _ts from '#ts';
import _cs from '#cs';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    selectedSectors: PropTypes.array.isRequired,
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    prioritySectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    specificNeedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    selectedSectors: editArySelectedSectorsSelector(state),
    affectedGroups: affectedGroupsSelector(state),
    prioritySectors: prioritySectorsSelector(state),
    specificNeedGroups: specificNeedGroupsSelector(state),
});

@connect(mapStateToProps)
export default class CrossSector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static nodeIdSelector = d => d.id;
    static nodeLabelSelector = d => d.title;
    static nodeChildrenSelector = d => d.children;

    static rowFieldTitles = [
        {
            key: 'prioritySectors',
            title: _ts('editAssessment.summary', 'prioritySectors'),
        },
        {
            key: 'affectedGroups',
            title: _ts('editAssessment.summary', 'affectedGroups'),
        },
        {
            key: 'specificNeedGroups',
            title: _ts('editAssessment.summary', 'specificNeedGroups'),
        },
    ];

    static rowSubFieldTitles = [
        {
            key: 'rank1',
            title: _ts('editAssessment.summary', 'rank1Title'),
        },
        {
            key: 'rank2',
            title: _ts('editAssessment.summary', 'rank2Title'),
        },
        {
            key: 'rank3',
            title: _ts('editAssessment.summary', 'rank3Title'),
        },
    ];

    static columnFieldTitles = [
        {
            key: 'moderateAssistancePopulation',
            title: _ts('editAssessment.summary', 'moderateAssistancePopulation'),
        },
        {
            key: 'severeAssistancePopulation',
            title: _ts('editAssessment.summary', 'severeAssistancePopulation'),
        },
        {
            key: 'assistancePopulation',
            title: _ts('editAssessment.summary', 'assistancePopulation'),
        },
    ];

    getClassName = (empty = false) => {
        const { className: classNameFromProps } = this.props;
        return _cs(
            classNameFromProps,
            'cross-sector',
            styles.crossSector,
            empty && 'empty',
            empty && styles.empty,
        );
    }

    renderInput = (rowKey, subRowKey, columnKey) => {
        const {
            prioritySectors,
            affectedGroups,
            specificNeedGroups,
        } = this.props;

        if (rowKey === 'prioritySectors') {
            return (
                <HiearchicalSelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={prioritySectors}
                    keySelector={CrossSector.nodeIdSelector}
                    labelSelector={CrossSector.nodeLabelSelector}
                    childrenSelector={CrossSector.nodeChildrenSelector}
                    placeholder=""
                />
            );
        } else if (rowKey === 'affectedGroups') {
            return (
                <HiearchicalSelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={affectedGroups}
                    keySelector={CrossSector.nodeIdSelector}
                    labelSelector={CrossSector.nodeLabelSelector}
                    childrenSelector={CrossSector.nodeChildrenSelector}
                    placeholder=""
                />
            );
        } else if (rowKey === 'specificNeedGroups') {
            return (
                <SelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={specificNeedGroups}
                    labelSelector={CrossSector.nodeLabelSelector}
                    keySelector={CrossSector.nodeIdSelector}
                    placeholder=""
                />
            );
        }

        return null;
    }

    render() {
        const { selectedSectors } = this.props;

        if (selectedSectors.length < MIN_SECTORS_SELECTION_FOR_CROSS_SECTOR) {
            const className = this.getClassName(true);
            const emptyText = _ts('editAssessment.summary', 'crossSectorEmptyText', { count: MIN_SECTORS_SELECTION_FOR_CROSS_SECTOR });

            return (
                <div className={className}>
                    { emptyText }
                </div>
            );
        }

        const className = this.getClassName();

        return (
            <FaramGroup faramElementName="crossSector">
                <TabularInputs
                    rowFieldTitles={CrossSector.rowFieldTitles}
                    columnFieldTitles={CrossSector.columnFieldTitles}
                    rowSubFieldTitles={CrossSector.rowSubFieldTitles}
                    classNames={{
                        wrapper: className,
                    }}
                    inputModifier={this.renderInput}
                />
            </FaramGroup>
        );
    }
}
