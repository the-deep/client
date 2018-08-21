import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    isTruthy,
    isObjectEmpty,
} from '#rsu/common';
import { FgRestBuilder } from '#rsu/rest';
import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import Faram from '#rscg/Faram';
import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';

import {
    createParamsForGet,
    createUrlForLeadFilterOptions,
} from '#rest';
import {
    activeProjectIdFromStateSelector,
    leadFilterOptionsForProjectSelector,

    setLeadPageFilterAction,

    leadPageFilterSelector,
    setLeadFilterOptionsAction,
    unsetLeadPageFilterAction,
} from '#redux';
import _ts from '#ts';
import schema from '#schema';


const propTypes = {
    activeProject: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leadFilterOptions: PropTypes.object.isRequired,

    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setLeadFilterOptions: PropTypes.func.isRequired,
    setLeadPageFilter: PropTypes.func.isRequired,
    unsetLeadPageFilter: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    filters: {},
    leadFilterOptions: {},
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: leadPageFilterSelector(state),
    leadFilterOptions: leadFilterOptionsForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
    unsetLeadPageFilter: params => dispatch(unsetLeadPageFilterAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterLeadsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);
        // eslint-disable-next-line no-unused-vars
        const { similar, ...values } = this.props.filters;
        this.state = {
            faramValues: values,
            pristine: true,
        };

        this.schema = {
            fields: {
                search: [],
                assignee: [],
                created_at: [],
                published_on: [],
                confidentiality: [],
                status: [],
            },
        };
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.requestProjectLeadFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        const { filters, activeProject } = nextProps;
        if (this.props.filters !== filters) {
            // eslint-disable-next-line no-unused-vars
            const { similar, ...values } = filters;
            this.setState({
                faramValues: values,
                pristine: true,
            });
        }

        if (this.props.activeProject !== activeProject) {
            this.requestProjectLeadFilterOptions(activeProject);
        }
    }

    componentWillUnmount() {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }
    }

    // REST

    requestProjectLeadFilterOptions = (activeProject) => {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line max-len
        this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(activeProject);
        this.leadFilterOptionsRequest.start();
    }

    createRequestForProjectLeadFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForLeadFilterOptions(activeProject);

        const leadFilterOptionsRequest = new FgRestBuilder()
            .url(urlForProjectFilterOptions)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ loadingLeadFilters: true });
            })
            .postLoad(() => {
                this.setState({ loadingLeadFilters: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectLeadFilterOptions');
                    this.props.setLeadFilterOptions({
                        projectId: activeProject,
                        leadFilterOptions: response,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .build();

        return leadFilterOptionsRequest;
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
        const { similar } = this.props.filters;
        this.props.setLeadPageFilter({
            filters: {
                ...values,
                similar,
            },
        });
    }

    handleClearSimilarSelection = () => {
        // unsetting only similar from filters
        this.props.setLeadPageFilter({
            filters: {
                ...this.props.filters,
                similar: undefined,
            },
        });
    }

    handleClearFilters = () => {
        if (isObjectEmpty(this.props.filters)) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({ faramValues: {}, pristine: true });
        } else {
            this.props.unsetLeadPageFilter();
        }
    }

    render() {
        const {
            className,
            leadFilterOptions: {
                confidentiality,
                status,
                assignee,
            },
            filters,
        } = this.props;

        const {
            faramValues,
            pristine,
            loadingLeadFilters,
        } = this.state;

        const isApplyDisabled = pristine;

        const isFilterEmpty = isObjectEmpty(filters);
        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Faram
                className={`leads-filters ${className}`}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
                disabled={loadingLeadFilters}
            >
                <SearchInput
                    faramElementName="search"
                    label={_ts('leads', 'placeholderSearch')}
                    placeholder={_ts('leads', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <DateFilter
                    faramElementName="published_on"
                    label={_ts('leads', 'filterDatePublished')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <MultiSelectInput
                    faramElementName="assignee"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={_ts('leads', 'assigneeLabel')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={assignee}
                    placeholder={_ts('leads', 'placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <DateFilter
                    faramElementName="created_at"
                    label={_ts('leads', 'filterDateCreated')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <MultiSelectInput
                    faramElementName="confidentiality"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={_ts('leads', 'filterConfidentiality')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={confidentiality}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <MultiSelectInput
                    faramElementName="status"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={_ts('leads', 'filterStatus')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={status}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <Button
                    className="button apply-filter-button"
                    disabled={isApplyDisabled || loadingLeadFilters}
                    type="submit"
                >
                    {_ts('leads', 'filterApplyFilter')}
                </Button>
                <DangerButton
                    className="button clear-filter-button"
                    disabled={isClearDisabled || loadingLeadFilters}
                    onClick={this.handleClearFilters}
                >
                    {_ts('leads', 'filterClearFilter')}
                </DangerButton>
                {
                    isTruthy(filters.similar) && (
                        <DangerButton
                            className="button clear-similar-filter-button"
                            onClick={this.handleClearSimilarSelection}
                        >
                            {_ts('leads', 'filterClearSimilarFilter')}
                        </DangerButton>
                    )
                }
            </Faram>
        );
    }
}
