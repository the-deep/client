import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '#rsu/rest';
import {
    doesObjectHaveNoData,
    _cs,
} from '@togglecorp/fujs';
import SearchInput from '#rsci/SearchInput';
import SelectInput from '#rsci/SelectInput';
import DateFilter from '#rsci/DateFilter';
import TimeFilter from '#rsci/TimeFilter';
import RangeFilter from '#rsci/RangeFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';
import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';

import {
    activeProjectIdFromStateSelector,
    entriesViewFilterSelector,
    setEntriesViewFilterAction,
    unsetEntriesViewFilterAction,

    projectDetailsSelector,
    entryFilterOptionsForProjectSelector,
    setEntryFilterOptionsAction,
} from '#redux';
import {
    createUrlForEntryFilterOptions,
    createParamsForGet,
} from '#rest';
import _ts from '#ts';

import GeoFilter from './GeoFilter';

import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    entryFilterOptions: entryFilterOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntriesViewFilter: params => dispatch(setEntriesViewFilterAction(params)),
    setEntryFilterOptions: params => dispatch(setEntryFilterOptionsAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
});

const propTypes = {
    applyOnChange: PropTypes.bool,
    filters: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    className: PropTypes.string,

    activeProject: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entryFilterOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setEntriesViewFilter: PropTypes.func.isRequired,
    setEntryFilterOptions: PropTypes.func.isRequired,
    unsetEntriesViewFilter: PropTypes.func.isRequired,
};

const defaultProps = {
    pending: true,
    className: undefined,
    filters: [],
    geoOptions: {},
    applyOnChange: false,
};

const emptyList = [];

const commentStatusOptions = [
    {
        key: 'resolved',
        value: _ts('entries', 'resolvedCommentLabel'),
    },
    {
        key: 'unresolved',
        value: _ts('entries', 'unresolvedCommentLabel'),
    },
];

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterEntriesForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);

        this.state = {
            pristine: true,
            filters: this.props.entriesFilters,
        };
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.requestProjectEntryFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        const {
            entriesFilters: oldFilter,
            activeProject: oldActiveProject,
        } = this.props;
        const {
            entriesFilters: newFilter,
            activeProject: newActiveProject,
        } = nextProps;

        if (oldFilter !== newFilter) {
            this.setState({
                pristine: true,
                filters: newFilter,
            });
        }

        if (oldActiveProject !== newActiveProject) {
            this.requestProjectEntryFilterOptions(newActiveProject);
        }
    }


    componentWillUnmount() {
        this.entryFilterOptionsRequest.stop();
    }

    // REST

    requestProjectEntryFilterOptions = (activeProject) => {
        if (this.entryFilterOptionsRequest) {
            this.entryFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line max-len
        this.entryFilterOptionsRequest = this.createRequestForProjectEntryFilterOptions(activeProject);
        this.entryFilterOptionsRequest.start();
    }

    createRequestForProjectEntryFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForEntryFilterOptions(activeProject);

        const entryFilterOptionsRequest = new FgRestBuilder()
            .url(urlForProjectFilterOptions)
            .params(createParamsForGet)
            .success((response) => {
                this.props.setEntryFilterOptions({
                    projectId: activeProject,
                    entryFilterOptions: response,
                });
            })
            .build();

        return entryFilterOptionsRequest;
    }


    handleApplyFilter = () => {
        const { filters } = this.state;
        this.props.setEntriesViewFilter({ filters });
    }

    handleClearFilter = () => {
        const { pristine } = this.state;
        if (pristine) {
            this.props.unsetEntriesViewFilter();
        } else {
            this.setState({ filters: {} });
        }
    }

    handleFilterChange = (key, values) => {
        const filters = {
            ...this.state.filters,
            ...{ [key]: values },
        };
        this.setState({
            filters,
            pristine: false,
        }, () => {
            if (this.props.applyOnChange) {
                this.handleApplyFilter();
            }
        });
    }


    renderFilter = ({ title, key, properties: filter }) => {
        const { filters } = this.state;
        if (!filter || !filter.type) {
            return null;
        }

        const props = {
            key,
            className: styles.entriesFilter,
            label: title,
            onChange: values => this.handleFilterChange(key, values),
            value: filters[key],
            disabled: this.props.pending,
        };

        switch (filter.type) {
            case 'geo': {
                const {
                    geoOptions,
                    projectDetails,
                } = this.props;

                return (
                    <GeoFilter
                        {...props}
                        value={props.value}
                        disabled={props.disabled}
                        geoOptions={geoOptions}
                        regions={projectDetails.regions}
                    />
                );
            }
            case 'multiselect':
                return (
                    <MultiSelectInput
                        {...props}
                        value={props.value || emptyList}
                        options={filter.options || emptyList}
                        showHintAndError={false}
                        placeholder={_ts('entries', 'multiselectPlaceholder')}
                    />
                );
            case 'multiselect-range':
                return (
                    <RangeFilter
                        {...props}
                        options={filter.options}
                        showHintAndError={false}
                        placeholder={_ts('entries', 'multiselectRangePlaceholder')}
                    />
                );
            case 'date':
                return (
                    <DateFilter
                        {...props}
                        showHintAndError={false}
                        placeholder={_ts('entries', 'datePlaceholder')}
                    />
                );
            case 'time':
                return (
                    <TimeFilter
                        {...props}
                        showHintAndError={false}
                        placeholder={_ts('entries', 'timePlaceholder')}
                    />
                );
            case 'text':
                return (
                    <SearchInput
                        {...props}
                        showHintAndError={false}
                        placeholder={_ts('entries', 'textSearchPlaceholder')}
                    />
                );
            default:
                return null;
        }
    }

    render() {
        const {
            pending,
            className,
            entryFilterOptions,
            applyOnChange,
        } = this.props;
        const {
            pristine,
            filters,
        } = this.state;

        const isFilterEmpty = doesObjectHaveNoData(filters, ['']);

        const { createdBy } = entryFilterOptions;

        return (
            <div className={_cs(styles.entriesFilters, className)} >
                <SearchInput
                    className={styles.entriesFilter}
                    label={_ts('entries', 'searchFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('search', value); }}
                    placeholder={_ts('entries', 'searchFilterPlaceholder')}
                    showHintAndError={false}
                    value={filters.search}
                    disabled={pending}
                />
                <MultiSelectInput
                    className={styles.entriesFilter}
                    keySelector={FilterEntriesForm.optionKeySelector}
                    labelSelector={FilterEntriesForm.optionLabelSelector}
                    options={createdBy}
                    label={_ts('entries', 'createdByFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('created_by', value); }}
                    showHintAndError={false}
                    value={filters.created_by || emptyList}
                    disabled={pending}
                    placeholder={_ts('entries', 'createdByPlaceholder')}
                />
                <DateFilter
                    className={styles.entriesFilter}
                    label={_ts('entries', 'createdAtFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('created_at', value); }}
                    showHintAndError={false}
                    value={filters.created_at}
                    disabled={pending}
                    placeholder={_ts('entries', 'createdAtPlaceholder')}
                />
                <MultiSelectInput
                    className={styles.entriesFilter}
                    keySelector={FilterEntriesForm.optionKeySelector}
                    labelSelector={FilterEntriesForm.optionLabelSelector}
                    options={createdBy}
                    label={_ts('entries', 'commentAssignedToFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('comment_assignee', value); }}
                    showHintAndError={false}
                    value={filters.comment_assignee || emptyList}
                    disabled={pending}
                    placeholder={_ts('entries', 'createdByPlaceholder')}
                />
                <MultiSelectInput
                    className={styles.entriesFilter}
                    keySelector={FilterEntriesForm.optionKeySelector}
                    labelSelector={FilterEntriesForm.optionLabelSelector}
                    options={createdBy}
                    label={_ts('entries', 'commentCreatedByFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('comment_created_by', value); }}
                    showHintAndError={false}
                    value={filters.comment_created_by || emptyList}
                    disabled={pending}
                    placeholder={_ts('entries', 'commentCreatedByPlaceholder')}
                />
                <SelectInput
                    className={styles.entriesFilter}
                    keySelector={FilterEntriesForm.optionKeySelector}
                    labelSelector={FilterEntriesForm.optionLabelSelector}
                    options={commentStatusOptions}
                    label={_ts('entries', 'commentStatusOptionsFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('comment_status', value); }}
                    showHintAndError={false}
                    value={filters.comment_status || emptyList}
                    disabled={pending}
                    placeholder={_ts('entries', 'commentStatusPlaceholder')}
                />
                { this.props.filters.map(this.renderFilter) }
                {
                    !applyOnChange && (
                        <Button
                            className={styles.button}
                            onClick={this.handleApplyFilter}
                            disabled={pending || pristine}
                        >
                            {_ts('entries', 'applyFilterButtonLabel')}
                        </Button>
                    )
                }
                <DangerButton
                    className={styles.button}
                    onClick={this.handleClearFilter}
                    disabled={pending || isFilterEmpty}
                >
                    {_ts('entries', 'clearFilterButtonLabel')}
                </DangerButton>
            </div>
        );
    }
}
