import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram from '@togglecorp/faram';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import SearchInput from '#rsci/SearchInput';
import SelectInput from '#rsci/SelectInput';

import {
    leadAddSetLeadFiltersAction,
    leadAddClearLeadFiltersAction,
    leadAddPageLeadFiltersSelector,
} from '#redux';

import _ts from '#ts';

import { LEAD_FILTER_STATUS } from '../utils';

import styles from './styles.scss';

const leadStatusFilterOptions = [
    { key: LEAD_FILTER_STATUS.invalid, label: 'Invalid' },
    { key: LEAD_FILTER_STATUS.saved, label: 'Saved' },
    { key: LEAD_FILTER_STATUS.unsaved, label: 'Unsaved' },
];

const faramSchema = {
    fields: {},
};

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onFilterClear: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

function LeadFilter(props) {
    const {
        filters,
        onFilterChange,
        onFilterClear,
        className,
    } = props;

    const clearDisabled = doesObjectHaveNoData(filters, ['']);

    return (
        <Faram
            className={_cs(styles.container, className)}
            value={filters}
            onChange={onFilterChange}
            schema={faramSchema}
        >
            <SearchInput
                faramElementName="search"
                label={_ts('addLeads.filters', 'placeholderSearch')}
                placeholder={_ts('addLeads.filters', 'placeholderSearch')}
                showHintAndError={false}
            />
            {/*
            <TextInput
                faramElementName="source"
                label={_ts('addLeads.filters', 'filterPublisher')}
                placeholder={_ts('addLeads.filters', 'placeholderAny')}
                showHintAndError={false}
            />
            <MultiSelectInput
                faramElementName="type"
                label={_ts('addLeads.filters', 'filterSourceType')}
                showLabel
                options={leadTypeOptions}
                placeholder={_ts('addLeads.filters', 'placeholderAny')}
                showHintAndError={false}
            />
            */}
            <SelectInput
                faramElementName="status"
                label={_ts('addLeads.filters', 'filterStatus')}
                showLabel
                options={leadStatusFilterOptions}
                placeholder={_ts('addLeads.filters', 'placeholderAny')}
                showHintAndError={false}
            />
            <DangerButton
                disabled={clearDisabled}
                onClick={onFilterClear}
            >
                {_ts('addLeads.filters', 'filterClearFilter')}
            </DangerButton>
        </Faram>
    );
}
LeadFilter.propTypes = propTypes;
LeadFilter.defaultProps = defaultProps;


const mapStateToProps = state => ({
    filters: leadAddPageLeadFiltersSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onFilterChange: params => dispatch(leadAddSetLeadFiltersAction(params)),
    onFilterClear: params => dispatch(leadAddClearLeadFiltersAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    LeadFilter,
);
