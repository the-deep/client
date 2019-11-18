import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram from '@togglecorp/faram';
import {
    _cs,
    isTruthy,
    isTruthyString,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import {
    RequestClient,
    methods,
} from '#request';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SelectInputWithList from '#rsci/SelectInputWithList';

import {
    activeProjectIdFromStateSelector,
    leadFilterOptionsForProjectSelector,

    setLeadPageFilterAction,

    leadPageFilterSelector,
    setLeadFilterOptionsAction,
    unsetLeadPageFilterAction,
} from '#redux';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    activeProject: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leadFilterOptions: PropTypes.object.isRequired,

    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    setLeadFilterOptions: PropTypes.func.isRequired,
    setLeadPageFilter: PropTypes.func.isRequired,
    unsetLeadPageFilter: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onEmmStatusReceive: PropTypes.func.isRequired,

    filterOnlyUnprotected: PropTypes.bool,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    filters: {},
    leadFilterOptions: {},
    filterOnlyUnprotected: false,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: leadPageFilterSelector(state),
    leadFilterOptions: leadFilterOptionsForProjectSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
    unsetLeadPageFilter: params => dispatch(unsetLeadPageFilterAction(params)),
});

const emptyList = [];
const emptyObject = {};

const requestOptions = {
    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.GET,
        query: ({ props: { activeProject } }) => ({
            projects: [activeProject],
        }),
        onPropsChanged: ['activeProject'],
        onMount: true,
        extras: {
            schemaName: 'projectLeadFilterOptions',
        },
        onSuccess: ({
            response,
            props: {
                setLeadFilterOptions,
                activeProject,
                onEmmStatusReceive,
            },
        }) => {
            setLeadFilterOptions({
                projectId: activeProject,
                leadFilterOptions: response,
            });
            if (onEmmStatusReceive) {
                onEmmStatusReceive(response.hasEmmLeads);
            }
        },
    },
};

const MAX_DISPLAY_OPTIONS = 50;

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class FilterLeadsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    static emmRiskFactorsKeySelector = (d = {}) => (isTruthyString(d.key) ? d.key : 'None');
    static emmRiskFactorsLabelSelector = (d = {}) => (isTruthyString(d.label)
        ? `${d.label} (${d.totalCount})`
        : `None (${d.totalCount})`
    );

    static emmEntitiesKeySelector = (d = {}) => d.key;
    static emmEntitiesLabelSelector = (d = {}) => `${d.label} (${d.totalCount})`;

    static emmTriggerKeySelector = (d = {}) => d.key;
    static emmTriggerLabelSelector = (d = {}) => `${d.label} (${d.totalCount})`;

    constructor(props) {
        super(props);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
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
                emm_risk_factors: [],
                emm_keywords: [],
                emm_entities: [],
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        const { filters: newFilters } = nextProps;
        const { filters: oldFilters } = this.props;

        if (newFilters !== oldFilters) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            const { similar, ...values } = newFilters;

            this.setState({
                faramValues: values,
                pristine: true,
            });
        }
    }

    handleFaramChange = (values) => {
        this.setState({
            faramValues: values,
            pristine: false,
        });
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
        const {
            filters,
            unsetLeadPageFilter,
        } = this.props;

        if (doesObjectHaveNoData(filters, [''])) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({
                faramValues: {},
                pristine: true,
            });
        } else {
            unsetLeadPageFilter();
        }
    }

    render() {
        const {
            className,
            leadFilterOptions: {
                confidentiality,
                status,
                assignee,
                emmEntities = emptyList,
                emmKeywords = emptyList,
                emmRiskFactors = emptyList,
            },
            requests: {
                leadOptionsRequest: {
                    response: { hasEmmLeads } = emptyObject,
                    pending: loadingLeadFilters,
                },
            },
            filters,
            filterOnlyUnprotected,
        } = this.props;

        const {
            faramValues,
            pristine,
        } = this.state;

        const isApplyDisabled = pristine;

        let isFilterEmpty;

        if (filterOnlyUnprotected) {
            let newFilter = {
                ...filters,
                confidentiality: undefined,
            };

            isFilterEmpty = doesObjectHaveNoData(newFilter, ['']);

            newFilter = {
                ...filters,
                confidentiality: ['unprotected'],
            };
        } else {
            isFilterEmpty = doesObjectHaveNoData(filters, ['']);
        }

        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Faram
                className={_cs(styles.leadsFilters, className)}
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
                    className={styles.leadsFilter}
                />
                <DateFilter
                    faramElementName="published_on"
                    label={_ts('leads', 'filterDatePublished')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
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
                    className={styles.leadsFilter}
                />
                <DateFilter
                    faramElementName="created_at"
                    label={_ts('leads', 'filterDateCreated')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                {!filterOnlyUnprotected && (
                    <MultiSelectInput
                        faramElementName="confidentiality"
                        keySelector={FilterLeadsForm.optionKeySelector}
                        label={_ts('leads', 'filterConfidentiality')}
                        labelSelector={FilterLeadsForm.optionLabelSelector}
                        options={confidentiality}
                        placeholder={_ts('leads', 'placeholderAny')}
                        showHintAndError={false}
                        showLabel
                        className={styles.leadsFilter}
                    />
                )}
                <MultiSelectInput
                    faramElementName="status"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={_ts('leads', 'filterStatus')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={status}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                {hasEmmLeads && (
                    <React.Fragment>
                        <SelectInputWithList
                            faramElementName="emm_risk_factors"
                            keySelector={FilterLeadsForm.emmRiskFactorsKeySelector}
                            label={_ts('leads', 'filterEmmRiskFactors')}
                            labelSelector={FilterLeadsForm.emmRiskFactorsLabelSelector}
                            options={emmRiskFactors}
                            placeholder={_ts('leads', 'placeholderAny')}
                            showHintAndError={false}
                            listType="inline"
                            showLabel
                            className={styles.leadsFilter}
                            maxDisplayOptions={MAX_DISPLAY_OPTIONS}
                        />
                        <SelectInputWithList
                            faramElementName="emm_keywords"
                            keySelector={FilterLeadsForm.emmTriggerKeySelector}
                            label={_ts('leads', 'filterEmmTriggers')}
                            labelSelector={FilterLeadsForm.emmTriggerLabelSelector}
                            options={emmKeywords}
                            placeholder={_ts('leads', 'placeholderAny')}
                            showHintAndError={false}
                            listType="inline"
                            showLabel
                            className={styles.leadsFilter}
                            maxDisplayOptions={MAX_DISPLAY_OPTIONS}
                        />
                        <SelectInputWithList
                            faramElementName="emm_entities"
                            keySelector={FilterLeadsForm.emmEntitiesKeySelector}
                            label={_ts('leads', 'filterEmmEntities')}
                            labelSelector={FilterLeadsForm.emmEntitiesLabelSelector}
                            options={emmEntities}
                            placeholder={_ts('leads', 'placeholderAny')}
                            showHintAndError={false}
                            showLabel
                            listType="inline"
                            className={styles.leadsFilter}
                            maxDisplayOptions={MAX_DISPLAY_OPTIONS}
                        />
                    </React.Fragment>
                )}
                <Button
                    className={styles.button}
                    disabled={isApplyDisabled || loadingLeadFilters}
                    type="submit"
                >
                    {_ts('leads', 'filterApplyFilter')}
                </Button>
                <DangerButton
                    className={styles.button}
                    disabled={isClearDisabled || loadingLeadFilters}
                    onClick={this.handleClearFilters}
                >
                    {_ts('leads', 'filterClearFilter')}
                </DangerButton>
                {
                    isTruthy(filters.similar) && (
                        <DangerButton
                            className={styles.button}
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
