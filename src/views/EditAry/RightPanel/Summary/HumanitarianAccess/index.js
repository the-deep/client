import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '#rscg/FaramGroup';
import SelectInput from '#rsci/SelectInput';
import HiearchicalSelectInput from '#rsci/HierarchicalSelectInput';

import {
    priorityIssuesSelector,
    affectedLocationsSelector,
} from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    priorityIssues: PropTypes.arrayOf(PropTypes.object).isRequired,
    affectedLocations: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    priorityIssues: priorityIssuesSelector(state),
    affectedLocations: affectedLocationsSelector(state),
});

@connect(mapStateToProps)
export default class HumanitarianAccess extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static nodeIdSelector = d => d.id;
    static nodeLabelSelector = d => d.title;
    static nodeChildrenSelector = d => d.children;

    constructor(props) {
        super(props);

        this.rowFieldTitles = [
            _ts('editAssessment.summary', 'priorityIssue'),
            _ts('editAssessment.summary', 'affectedLocation'),
        ];

        this.columnFieldTitles = [
            '',
            _ts('editAssessment.summary', 'limitedAccessPopulation'),
            _ts('editAssessment.summary', 'restrictedAccessPopulation'),
            _ts('editAssessment.summary', 'humanitarianAccessPopulation'),
        ];

        this.rowSubFieldTitles = [
            _ts('editAssessment.summary', 'rank1Title'),
            _ts('editAssessment.summary', 'rank2Title'),
            _ts('editAssessment.summary', 'rank3Title'),
        ];

        this.columnKeys = [
            'limitedAccessPopulation',
            'restrictedAccessPopulation',
            'humanitarianAccessPopulation',
        ];
    }

    renderInput = (column, row, subRow) => {
        const {
            priorityIssues,
            affectedLocations,
        } = this.props;

        const columnKey = this.columnKeys[column];

        if (row === 0) {
            return (
                <HiearchicalSelectInput
                    faramElementName={`priorityIssue-${subRow}-${columnKey}`}
                    showHintAndError={false}
                    options={priorityIssues}
                    keySelector={HumanitarianAccess.nodeIdSelector}
                    labelSelector={HumanitarianAccess.nodeLabelSelector}
                    childrenSelector={HumanitarianAccess.nodeChildrenSelector}
                    placeholder=""
                />
            );
        } else if (row === 1) {
            return (
                <SelectInput
                    faramElementName={`affectedLocation-${subRow}-${columnKey}`}
                    showHintAndError={false}
                    options={affectedLocations}
                    labelSelector={HumanitarianAccess.nodeLabelSelector}
                    keySelector={HumanitarianAccess.nodeIdSelector}
                    placeholder=""
                />
            );
        }

        return null;
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const className = _cs(
            classNameFromProps,
            'humanitarian-access',
            styles.humanitarianAccess,
        );

        return (
            <FaramGroup faramElementName="humanitarianAccess">
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
