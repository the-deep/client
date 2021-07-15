import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram from '@togglecorp/faram';
import {
    RequestClient,
    methods,
} from '#request';
import {
    _cs,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';

import {
    activeProjectIdFromStateSelector,
    aryPageFilterSelector,

    setAryPageFilterAction,
    unsetAryPageFilterAction,
} from '#redux';
import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

const emptyArray = [];

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    activeProject: PropTypes.number.isRequired,

    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setAryPageFilter: PropTypes.func.isRequired,
    unsetAryPageFilter: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    className: undefined,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: aryPageFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryPageFilter: params => dispatch(setAryPageFilterAction(params)),
    unsetAryPageFilter: params => dispatch(unsetAryPageFilterAction(params)),
});

const requestOptions = {
    filterOptionsRequest: {
        url: '/assessment-options/',
        query: ({ props: { activeProject } }) => ({
            project: activeProject,
        }),
        method: methods.GET,
        onPropsChanged: ['activeProject'],
        onMount: true,
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('assessments', 'assessmentsNotifyTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'aryEntryFilterOptionsResponse',
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
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

    componentWillReceiveProps(nextProps) {
        const { filters: oldFilters } = this.props;
        const { filters: newFilters } = nextProps;

        if (oldFilters !== newFilters) {
            // eslint-disable-next-line no-unused-vars
            this.setState({
                faramValues: newFilters,
                pristine: true,
            });
        }
    }

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
        const {
            filters,
            unsetAryPageFilter,
        } = this.props;

        if (doesObjectHaveNoData(filters, [''])) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({
                faramValues: {},
                pristine: true,
            });
        } else {
            unsetAryPageFilter();
        }
    }

    render() {
        const {
            className,
            requests: {
                filterOptionsRequest: {
                    response: {
                        // created by is options
                        createdBy = emptyArray,
                    } = {},
                    pending,
                },
            },
            filters,
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
                className={_cs(styles.arysFilters, className)}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
                disabled={pending}
            >
                <SearchInput
                    className={styles.input}
                    faramElementName="search"
                    label={_ts('assessments', 'placeholderSearch')}
                    placeholder={_ts('assessments', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                />
                <DateFilter
                    className={styles.input}
                    faramElementName="created_at"
                    label={_ts('assessments', 'filterDateCreated')}
                    placeholder={_ts('assessments', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                />
                <MultiSelectInput
                    className={styles.input}
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
                    className={styles.button}
                    disabled={isApplyDisabled}
                    type="submit"
                >
                    {_ts('assessments', 'filterApplyFilter')}
                </Button>
                <DangerButton
                    className={styles.button}
                    disabled={isClearDisabled}
                    onClick={this.handleClearFilters}
                >
                    {_ts('assessments', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        );
    }
}
