import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import Faram from '#rscg/Faram';
import SegmentInput from '#rsci/SegmentInput';
import ListSelection from '#rsci/ListSelection';
import SearchInput from '#rsci/SearchInput';
import { isObjectEmpty } from '#rsu/common';

import {
    discoverProjectsFiltersSelector,

    setDiscoverProjectsFilterAction,
    unsetDiscoverProjectsFilterAction,

    setDiscoverProjectsProjectOptionsAction,
    discoverProjectsProjectOptionsSelector,
} from '#redux';
import _ts from '#ts';

import ProjectOptionsRequest from './requests/ProjectOptionsRequest';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setDiscoverProjectFilter: PropTypes.func.isRequired,
    unsetDiscoverProjectFilter: PropTypes.func.isRequired,
    setDiscoverProjectProjectOptions: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired,
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

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterProjectsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);

        this.state = {
            faramValues: this.props.filters,
            pristine: true,
            pendingProjectOptionss: false,
        };

        this.schema = {
            fields: {
                search: [],
                status: [],
                involvement: [],
            },
        };

        this.projectOptionsRequest = new ProjectOptionsRequest({
            setState: d => this.setState(d),
            setProjectOptions: this.props.setDiscoverProjectProjectOptions,
        });
    }

    componentDidMount() {
        this.projectOptionsRequest.init();
        this.projectOptionsRequest.start();
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

    componentWillUnmount() {
        this.projectOptionsRequest.stop();
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
        if (isObjectEmpty(this.props.filters)) {
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
        } = this.props;

        const {
            faramValues,
            pristine,
            pendingProjectOptionss,
        } = this.state;

        const isApplyDisabled = pristine;

        const isFilterEmpty = isObjectEmpty(filters);
        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Faram
                className={`projects-filters ${className}`}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
                disabled={pendingProjectOptionss}
            >
                <SearchInput
                    faramElementName="search"
                    label={_ts('discoverProjects.filter', 'placeholderSearch')}
                    placeholder={_ts('discoverProjects.filter', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="projects-filter"
                />
                <SegmentInput
                    faramElementName="involvement"
                    keySelector={FilterProjectsForm.optionKeySelector}
                    labelSelector={FilterProjectsForm.optionLabelSelector}
                    label={_ts('discoverProjects.filter', 'projects')}
                    options={projectOptions.involvement}
                    placeholder={_ts('discoverProjects.filter', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className="projects-filter"
                />
                <ListSelection
                    faramElementName="status"
                    keySelector={FilterProjectsForm.optionKeySelector}
                    labelSelector={FilterProjectsForm.optionLabelSelector}
                    label={_ts('discoverProjects.filter', 'status')}
                    options={projectOptions.status}
                    placeholder={_ts('discoverProjects.filter', 'placeholderAny')}
                    showHintAndError={false}
                    segment
                    showLabel
                    className="projects-filter"
                />
                <Button
                    className="button apply-filter-button"
                    disabled={isApplyDisabled || pendingProjectOptionss}
                    type="submit"
                >
                    {_ts('discoverProjects.filter', 'filterApplyFilter')}
                </Button>
                <DangerButton
                    className="button clear-filter-button"
                    disabled={isClearDisabled || pendingProjectOptionss}
                    onClick={this.handleClearFilters}
                >
                    {_ts('discoverProjects.filter', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        );
    }
}
