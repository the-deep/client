import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import SelectInput from '../../../../../vendor/react-store/components/Input/SelectInput';
import HiearchicalSelectInput from '../../../../../vendor/react-store/components/Input/HierarchicalSelectInput';

import {
    editArySelectedSectorsSelector,
    affectedGroupsSelector,
    prioritySectorsSelector,
    specificNeedGroupsSelector,
} from '../../../../../redux';
import _ts from '../../../../../ts';

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

    constructor(props) {
        super(props);

        this.rowFieldTitles = [
            _ts('editAssessment.summary', 'prioritySectors'),
            _ts('editAssessment.summary', 'affectedGroups'),
            _ts('editAssessment.summary', 'specificNeedGroups'),
        ];

        this.columnFieldTitles = [
            ' ',
            _ts('editAssessment.summary', 'moderateAssistancePopulation'),
            _ts('editAssessment.summary', 'severeAssistancePopulation'),
            _ts('editAssessment.summary', 'assistancePopulation'),
        ];

        this.rowSubFieldTitles = [
            _ts('editAssessment.summary', 'rank1Title'),
            _ts('editAssessment.summary', 'rank2Title'),
            _ts('editAssessment.summary', 'rank3Title'),
        ];

        this.columnKeys = [
            'moderateAssistancePopulation',
            'severeAssistancePopulation',
            'assistancePopulation',
        ];
    }

    getClassName = (empty = false) => {
        const { className } = this.props;
        const classNames = [
            className,
            'cross-sector',
            styles.crossSector,
        ];

        if (empty) {
            classNames.push('empty');
            classNames.push(styles.empty);
        }

        return classNames.join(' ');
    }

    renderInput = (column, row, subRow) => {
        const {
            prioritySectors,
            affectedGroups,
            specificNeedGroups,
        } = this.props;

        const columnKey = this.columnKeys[column];

        if (row === 0) {
            return (
                <HiearchicalSelectInput
                    faramElementName={`priority-sector-${subRow}-${columnKey}`}
                    showHintAndError={false}
                    options={prioritySectors}
                    keySelector={CrossSector.nodeIdSelector}
                    labelSelector={CrossSector.nodeLabelSelector}
                    childrenSelector={CrossSector.nodeChildrenSelector}
                />
            );
        } else if (row === 1) {
            return (
                <HiearchicalSelectInput
                    faramElementName={`affected-group-${subRow}-${columnKey}`}
                    showHintAndError={false}
                    options={affectedGroups}
                    keySelector={CrossSector.nodeIdSelector}
                    labelSelector={CrossSector.nodeLabelSelector}
                    childrenSelector={CrossSector.nodeChildrenSelector}
                />
            );
        } else if (row === 2) {
            return (
                <SelectInput
                    faramElementName={`specific-need-group-${subRow}-${columnKey}`}
                    showHintAndError={false}
                    options={specificNeedGroups}
                    labelSelector={CrossSector.nodeLabelSelector}
                    keySelector={CrossSector.nodeIdSelector}
                />
            );
        }

        return null;
    }

    render() {
        const { selectedSectors } = this.props;

        if (selectedSectors.length < 3) {
            const className = this.getClassName(true);
            const emptyText = _ts('editAssessment.summary', 'crossSectorEmptyText');

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
                    rowFieldTitles={this.rowFieldTitles}
                    columnFieldTitles={this.columnFieldTitles}
                    rowSubFieldTitles={this.rowSubFieldTitles}
                    classNames={{
                        wrapper: className,
                        table: styles.table,
                        head: styles.head,
                        body: styles.body,
                        row: styles.row,
                        header: styles.header,
                        cell: styles.cell,
                        sectionTitle: styles.sectionTitle,
                    }}
                    inputModifier={this.renderInput}
                />
            </FaramGroup>
        );
    }
}
