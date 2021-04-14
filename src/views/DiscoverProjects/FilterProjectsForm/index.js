import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram from '@togglecorp/faram';
import {
    _cs,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';
import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import MultiSegmentInput from '#rsci/MultiSegmentInput';
import SearchInput from '#rsci/SearchInput';

import {
    discoverProjectsFiltersSelector,

    setDiscoverProjectsFilterAction,
    unsetDiscoverProjectsFilterAction,

    setDiscoverProjectsProjectOptionsAction,
    discoverProjectsProjectOptionsSelector,
} from '#redux';

import {
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setDiscoverProjectFilter: PropTypes.func.isRequired,
    unsetDiscoverProjectFilter: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setDiscoverProjectProjectOptions: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    filters: {},
};

const mapStateToProps = state => ({
    filters: discoverProjectsFiltersSelector(state),
    projectOptions: discoverProjectsProjectOptionsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setDiscoverProjectFilter: params => dispatch(
        setDiscoverProjectsFilterAction(params),
    ),
    unsetDiscoverProjectFilter: params => dispatch(
        unsetDiscoverProjectsFilterAction(params),
    ),
    setDiscoverProjectProjectOptions: params => dispatch(
        setDiscoverProjectsProjectOptionsAction(params),
    ),
});

const requestOptions = {
    projectOptionsRequest: {
        url: '/project-options/',
        method: methods.GET,
        onMount: true,
        onSuccess: ({ props, response }) => {
            const { setDiscoverProjectProjectOptions } = props;

            setDiscoverProjectProjectOptions(response);
        },
    },
};

const emptyObject = {};
const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class FilterProjectsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    static statusTooltipSelector = (status = emptyObject) => {
        const conditions = status.conditions || emptyList;
        const isConditionsEmpty = conditions.length === 0;

        if (isConditionsEmpty) {
            return status.value;
        }

        // _ts('discoverProjects.filter.statusCondition', 'no_leads');
        // _ts('discoverProjects.filter.statusCondition', 'some_leads');
        // _ts('discoverProjects.filter.statusCondition', 'no_entries');
        // _ts('discoverProjects.filter.statusCondition', 'some_entries');
        const value = status.conditions.map(val => _ts('discoverProjects.filter.statusCondition', val.conditionType, { days: val.days }));

        if (status.andConditions) {
            return _ts('discoverProjects.filter.statusCondition', 'messageForAnd', { value });
        }
        return _ts('discoverProjects.filter.statusCondition', 'messageForOr', { value });
    };

    constructor(props) {
        super(props);

        this.state = {
            faramValues: this.props.filters,
            pristine: true,
        };

        this.schema = {
            fields: {
                search: [],
                // status: [],
                regions: [],
                involvement: [],
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        const { filters } = nextProps;
        if (this.props.filters !== filters) {
            this.setState({
                faramValues: filters,
                pristine: true,
            });
        }
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
        this.props.setDiscoverProjectFilter(values);
    }

    handleClearFilters = () => {
        if (doesObjectHaveNoData(this.props.filters, [''])) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({ faramValues: {}, pristine: true });
        } else {
            this.props.unsetDiscoverProjectFilter();
        }
    }

    render() {
        const {
            className,
            filters,
            projectOptions,
            requests: {
                projectOptionsRequest: { pending },
            },
        } = this.props;

        const {
            faramValues,
            pristine,
        } = this.state;

        const isApplyDisabled = pristine;

        const isFilterEmpty = doesObjectHaveNoData(filters, ['']);
        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Faram
                className={_cs(styles.projectFilters, className)}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
                disabled={pending}
            >
                <SearchInput
                    faramElementName="search"
                    label={_ts('discoverProjects.filter', 'placeholderSearch')}
                    placeholder={_ts('discoverProjects.filter', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className={styles.projectFilter}
                />
                <SearchMultiSelectInput
                    faramElementName="regions"
                    label={_ts('discoverProjects.filter', 'regionSelectLabel')}
                    keySelector={FilterProjectsForm.optionKeySelector}
                    labelSelector={FilterProjectsForm.optionLabelSelector}
                    options={projectOptions.regions}
                    showHintAndError={false}
                    showLabel
                    className={styles.projectFilter}
                />
                <MultiSegmentInput
                    faramElementName="involvement"
                    keySelector={FilterProjectsForm.optionKeySelector}
                    labelSelector={FilterProjectsForm.optionLabelSelector}
                    label={_ts('discoverProjects.filter', 'projects')}
                    options={projectOptions.involvement}
                    placeholder={_ts('discoverProjects.filter', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className={styles.projectFilter}
                />
                {/*
                    <MultiSegmentInput
                        faramElementName="status"
                        keySelector={FilterProjectsForm.optionKeySelector}
                        labelSelector={FilterProjectsForm.optionLabelSelector}
                        label={_ts('discoverProjects.filter', 'status')}
                        options={projectOptions.status}
                        tooltipSelector={FilterProjectsForm.statusTooltipSelector}
                        placeholder={_ts('discoverProjects.filter', 'placeholderAny')}
                        showHintAndError={false}
                        showLabel
                        className={styles.projectFilter}
                    />
                */}
                <Button
                    className={styles.button}
                    disabled={isApplyDisabled}
                    pending={pending}
                    type="submit"
                >
                    {_ts('discoverProjects.filter', 'filterApplyFilter')}
                </Button>
                <DangerButton
                    className={styles.button}
                    disabled={isClearDisabled || pending}
                    onClick={this.handleClearFilters}
                >
                    {_ts('discoverProjects.filter', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        );
    }
}
