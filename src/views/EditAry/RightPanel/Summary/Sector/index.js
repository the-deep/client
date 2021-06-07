import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaramGroup } from '@togglecorp/faram';

import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import HiearchicalSelectInput from '#rsci/HierarchicalSelectInput';

import {
    affectedGroupsSelector,
    specificNeedGroupsSelector,
    underlyingFactorsSelector,
} from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    sectorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    specificNeedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    underlyingFactors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    affectedGroups: affectedGroupsSelector(state),
    specificNeedGroups: specificNeedGroupsSelector(state),
    underlyingFactors: underlyingFactorsSelector(state),
});

@connect(mapStateToProps)
export default class Sector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static nodeIdSelector = d => d.id;
    static nodeLabelSelector = d => d.title;
    static nodeChildrenSelector = d => d.children;

    static rowFieldTitles = [
        {
            key: 'outcomes',
            title: _ts('editAssessment.summary', 'outcomes'),
        },
        {
            key: 'underlyingFactors',
            title: _ts('editAssessment.summary', 'underlyingFactors'),
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

    renderInput = (rowKey, subRowKey, columnKey) => {
        const {
            affectedGroups,
            specificNeedGroups,
            underlyingFactors,
        } = this.props;

        if (rowKey === 'outcomes') {
            return (
                <TextInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                />
            );
        } else if (rowKey === 'underlyingFactors') {
            return (
                <HiearchicalSelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={underlyingFactors}
                    labelSelector={Sector.nodeLabelSelector}
                    keySelector={Sector.nodeIdSelector}
                    childrenSelector={Sector.nodeChildrenSelector}
                    placeholder=""
                />
            );
        } else if (rowKey === 'affectedGroups') {
            return (
                <HiearchicalSelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={affectedGroups}
                    keySelector={Sector.nodeIdSelector}
                    labelSelector={Sector.nodeLabelSelector}
                    childrenSelector={Sector.nodeChildrenSelector}
                    placeholder=""
                />
            );
        } else if (rowKey === 'specificNeedGroups') {
            return (
                <SelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={specificNeedGroups}
                    labelSelector={Sector.nodeLabelSelector}
                    keySelector={Sector.nodeIdSelector}
                    placeholder=""
                />
            );
        }

        return null;
    }

    render() {
        const {
            sectorId,
            className: classNameFromProps,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            'sector',
            styles.sector,
        );

        return (
            <FaramGroup faramElementName={`sector-${sectorId}`}>
                <TabularInputs
                    rowFieldTitles={Sector.rowFieldTitles}
                    columnFieldTitles={Sector.columnFieldTitles}
                    rowSubFieldTitles={Sector.rowSubFieldTitles}
                    classNames={{
                        wrapper: className,
                    }}
                    inputModifier={this.renderInput}
                />
            </FaramGroup>
        );
    }
}
