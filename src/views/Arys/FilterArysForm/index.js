import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { doesObjectHaveNoData } from '@togglecorp/fujs';
import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import Faram from '#rscg/Faram';
import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';

import {
    activeProjectIdFromStateSelector,

    setAryPageFilterAction,
    aryPageFilterSelector,
    unsetAryPageFilterAction,
    aryFilterOptionsForProjectSelector,
    setAryFilterOptionsAction,
} from '#redux';
import _ts from '#ts';

import AryFilterOptionsGetRequest from './requests/AryFilterOptionsGetRequest';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types

    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setAryPageFilter: PropTypes.func.isRequired,
    unsetAryPageFilter: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    aryFilterOptions: PropTypes.object.isRequired,
    setAryFilterOptions: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: aryPageFilterSelector(state),
    aryFilterOptions: aryFilterOptionsForProjectSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryPageFilter: params => dispatch(setAryPageFilterAction(params)),
    setAryFilterOptions: params => dispatch(setAryFilterOptionsAction(params)),
    unsetAryPageFilter: params => dispatch(unsetAryPageFilterAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterArysForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);
        this.state = {
            faramValues: this.props.filters,
            pristine: true,
        };

        this.schema = {
            fields: {
                created_at: [],
                created_by: [],
                search: [],
            },
        };
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.requestProjectAryFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        const {
            filters: oldFilters,
            activeProject: oldActiveProject,
        } = this.props;
        const {
            filters: newFilters,
            activeProject: newActiveProject,
        } = nextProps;

        if (oldFilters !== newFilters) {
            // eslint-disable-next-line no-unused-vars
            this.setState({
                faramValues: newFilters,
                pristine: true,
            });
        }

        if (oldActiveProject !== newActiveProject) {
            this.requestProjectAryFilterOptions(newActiveProject);
        }
    }

    componentWillUnmount() {
        if (this.aryFilterOptionsRequest) {
            this.aryFilterOptionsRequest.stop();
        }
    }

    requestProjectAryFilterOptions = (activeProject) => {
        if (this.aryFilterOptionsRequest) {
            this.aryFilterOptionsRequest.stop();
        }

        const aryFilterOptionsGetRequest = new AryFilterOptionsGetRequest({
            setState: params => this.setState(params),
            setAryFilterOptions: this.props.setAryFilterOptions,
        });

        this.aryFilterOptionsRequest = aryFilterOptionsGetRequest.create(activeProject);
        this.aryFilterOptionsRequest.start();
    }

    // UI

    handleFaramChange = (values) => {
        this.setState(
            {
                faramValues: values,
                pristine: false,
            },
        );
    }

    handleFaramValidationSuccess = (_, values) => {
        this.props.setAryPageFilter({
            filters: values,
        });
    }

    handleClearFilters = () => {
        if (doesObjectHaveNoData(this.props.filters)) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({ faramValues: {}, pristine: true });
        } else {
            this.props.unsetAryPageFilter();
        }
    }

    render() {
        const {
            className,
            aryFilterOptions: {
                createdBy,
            },
            filters,
        } = this.props;

        const {
            faramValues,
            pristine,
        } = this.state;

        const isApplyDisabled = pristine;

        const isFilterEmpty = doesObjectHaveNoData(filters);
        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Faram
                className={`arys-filters ${className}`}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
            >
                <SearchInput
                    faramElementName="search"
                    label={_ts('assessments', 'placeholderSearch')}
                    placeholder={_ts('assessments', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                />
                <DateFilter
                    faramElementName="created_at"
                    label={_ts('assessments', 'filterDateCreated')}
                    placeholder={_ts('assessments', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                />
                <MultiSelectInput
                    className="arys-filter"
                    faramElementName="created_by"
                    keySelector={FilterArysForm.optionKeySelector}
                    label={_ts('assessments', 'createdByFilterLabel')}
                    labelSelector={FilterArysForm.optionLabelSelector}
                    options={createdBy}
                    placeholder={_ts('assessments', 'placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                />
                <Button
                    className="button apply-filter-button"
                    disabled={isApplyDisabled}
                    type="submit"
                >
                    {_ts('assessments', 'filterApplyFilter')}
                </Button>
                <DangerButton
                    className="button clear-filter-button"
                    disabled={isClearDisabled}
                    onClick={this.handleClearFilters}
                >
                    {_ts('assessments', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        );
    }
}
