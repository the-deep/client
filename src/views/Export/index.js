import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    listToMap,
    compareString,
    compareDate,
} from '@togglecorp/fujs';

import Page from '#rscv/Page';
import { getFiltersForRequest } from '#entities/lead';
import update from '#rsu/immutable-update';
import { FgRestBuilder } from '#rsu/rest';
import AccentButton from '#rsca/Button/AccentButton';
import Table from '#rscv/Table';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import ExportPreview from '#components/other/ExportPreview';
import {
    createParamsForGet,
    createUrlForLeadsOfProject,
    createUrlForProjectFramework,
    createUrlForGeoOptions,

    transformResponseErrorToFormError,
} from '#rest';
import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
    leadPageFilterSelector,
    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    geoOptionsForProjectSelector,
    activeProjectRoleSelector,
} from '#redux';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import FilterLeadsForm from '#components/other/FilterLeadsForm';

import notify from '#notify';
import schema from '#schema';
import _ts from '#ts';

import FilterEntriesForm from '../Entries/FilterEntriesForm';

import ExportHeader from './ExportHeader';
import ExportTypePane from './ExportTypePane';
import styles from './styles.scss';

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    analysisFramework: analysisFrameworkForProjectSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    filters: leadPageFilterSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
    projectRole: activeProjectRoleSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setAnalysisFramework: PropTypes.func.isRequired,
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadsGetRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setGeoOptions: PropTypes.func.isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    projectRole: {},
    geoOptions: {},
    leadsGetRequest: {},
};

const requests = {
    leadsGetRequest: {
        url: '/v2/leads/filter/',
        method: requestMethods.POST,
        onMount: true,
        query: ({
            fields: ['id', 'title', 'created_at'],
        }),
        body: ({
            props: {
                projectId,
                filters,
                projectRole: {
                    exportPermissions = {},
                },
            },
        }) => {
            const filterOnlyUnprotected = exportPermissions.create_only_unprotected;
            const sanitizedFilters = getFiltersForRequest(filters);

            // Unprotected filter is sent to request to fetch leads
            // if user cannot create export for confidential documents
            if (filterOnlyUnprotected) {
                sanitizedFilters.confidentiality = ['unprotected'];
            }

            return ({
                project: [projectId],
                ...sanitizedFilters,
            });
        },
        onPropsChanged: [
            'activeProject',
            'filters',
        ],
        onSuccess: ({
            response,
            params: { setLeads: setLeadsFromParams },
        }) => {
            setLeadsFromParams(response);
        },
        onFailure: ({ error: { response } }) => {
            const message = transformResponseErrorToFormError(response.errors)
                .formErrors
                .errors
                .join(' ');
            notify.send({
                title: _ts('export', 'leadsLabel'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportButtonKeyExtractor = d => d.key;
    static leadKeyExtractor = d => d.id

    constructor(props) {
        super(props);

        const { leadsGetRequest } = this.props;

        leadsGetRequest.setDefaultParams({
            setLeads: this.handleSelectedLeadsSet,
        });

        // TABLE component
        this.headers = [
            {
                key: 'select',
                label: _ts('export', 'selectLabel'),
                order: 1,
                sortable: false,
                modifier: (d) => {
                    const key = Export.leadKeyExtractor(d);
                    return (
                        <AccentButton
                            title={d.selected ? 'Unselect' : 'Select'}
                            iconName={d.selected ? 'checkbox' : 'checkboxOutlineBlank'}
                            onClick={() => this.handleSelectLeadChange(key, !d.selected)}
                            smallVerticalPadding
                            transparent
                        />
                    );
                },
            },
            {
                key: 'title',
                label: _ts('export', 'titleLabel'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: _ts('export', 'createdAtLabel'),
                order: 3,
                sortable: true,
                comparator: (a, b) => (
                    compareDate(a.createdAt, b.createdAt) ||
                    compareString(a.title, b.title)
                ),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];

        this.defaultSort = {
            key: 'createdAt',
            order: 'dsc',
        };

        this.state = {
            activeExportTypeKey: 'word',
            previewId: undefined,
            reportStructure: undefined,
            decoupledEntries: true,

            selectedLeads: {},
            pendingAf: true,
            pendingGeoOptions: true,
        };
    }

    componentWillMount() {
        const { projectId } = this.props;

        this.analysisFrameworkRequest = this.createRequestForAnalysisFramework(
            projectId,
        );
        this.analysisFrameworkRequest.start();

        this.geoOptionsRequest = this.createRequestForGeoOptions(
            projectId,
        );
        this.geoOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            filters: newFilters,
            projectId: newActiveProject,
        } = nextProps;
        const {
            filters: oldFilters,
            projectId: oldActiveProject,
        } = this.props;

        if (oldActiveProject !== newActiveProject) {
            // Reset everything
            this.setState({
                activeExportTypeKey: 'word',
                previewId: undefined,
                reportStructure: undefined,
                decoupledEntries: true,

                selectedLeads: {},
                pendingAf: true,
                pendingGeoOptions: true,
            });

            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }
            this.analysisFrameworkRequest = this.createRequestForAnalysisFramework(
                newActiveProject,
            );
            this.analysisFrameworkRequest.start();

            if (this.geoOptionsRequest) {
                this.geoOptionsRequest.stop();
            }
            this.geoOptionsRequest = this.createRequestForGeoOptions(
                newActiveProject,
            );
            this.geoOptionsRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
        if (this.geoOptionsRequest) {
            this.geoOptionsRequest.stop();
        }
    }

    createRequestForAnalysisFramework = (projectId) => {
        const urlForAnalysisFramework = createUrlForGeoOptions(
            projectId,
        );
        const geoOptionsRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(createParamsForGet)
            .delay(0)
            .preLoad(() => {
                this.setState({ pendingGeoOptions: true });
            })
            .postLoad(() => {
                this.setState({ pendingGeoOptions: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'geoOptions');
                    this.props.setGeoOptions({
                        projectId,
                        locations: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.warn(response);
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('export', 'geoLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('export', 'geoLabel'),
                    type: notify.type.ERROR,
                    message: _ts('export', 'cantLoadGeo'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return geoOptionsRequest;
    }

    createRequestForGeoOptions = (projectId) => {
        const urlForAnalysisFramework = createUrlForProjectFramework(
            projectId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(createParamsForGet)
            .delay(0)
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .postLoad(() => {
                this.setState({ pendingAf: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({ analysisFramework: response });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.warn(response);
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('export', 'afLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('export', 'afLabel'),
                    type: notify.type.ERROR,
                    message: _ts('export', 'cantLoadAf'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return analysisFrameworkRequest;
    }

    handleSelectedLeadsSet = (response) => {
        const selectedLeads = listToMap(response.results, d => d.id, () => true);

        const leads = [];
        (response.results || []).forEach((l) => {
            leads.push({
                selected: true,
                ...l,
            });
        });

        this.setState({
            leads,
            selectedLeads,
        });
    }

    handleSelectLeadChange = (key, value) => {
        const {
            leads,
            selectedLeads,
        } = this.state;

        const rowIndex = leads.findIndex(d => d.id === key);

        const leadsSettings = {
            [rowIndex]: {
                selected: { $set: value },
            },
        };

        const settings = {
            [key]: {
                $set: value,
            },
        };
        const newSelectedLeads = update(selectedLeads, settings);
        const newLeads = update(leads, leadsSettings);

        this.setState({
            selectedLeads: newSelectedLeads,
            leads: newLeads,
        });
    }

    handleReportStructureChange = (value) => {
        this.setState({ reportStructure: value });
    }

    handleDecoupledEntriesChange = (value) => {
        this.setState({ decoupledEntries: value });
    }

    handleExportTypeSelectButtonClick = (key) => {
        this.setState({ activeExportTypeKey: key });
    }

    handlePreview = (exportId) => {
        this.setState({ previewId: exportId });
    }

    render() {
        const {
            previewId,
            activeExportTypeKey,
            reportStructure,
            decoupledEntries,
            selectedLeads,
            leads = [],

            pendingAf,
            pendingGeoOptions,
        } = this.state;

        const {
            analysisFramework,
            entriesFilters,
            projectId,
            geoOptions,
            projectRole: {
                exportPermissions = {},
            },
            leadsGetRequest: {
                pending: pendingLeads,
            },
        } = this.props;
        const { filters } = analysisFramework || {};
        const filterOnlyUnprotected = exportPermissions.create_only_unprotected;

        return (
            <Page
                className={styles.export}
                header={
                    <ExportHeader
                        projectId={projectId}
                        entriesFilters={entriesFilters}
                        className={styles.header}
                        activeExportTypeKey={activeExportTypeKey}
                        selectedLeads={selectedLeads}
                        reportStructure={reportStructure}
                        decoupledEntries={decoupledEntries}
                        onPreview={this.handlePreview}
                        pending={pendingLeads || pendingAf || pendingGeoOptions}
                        analysisFramework={analysisFramework}
                        geoOptions={geoOptions}
                    />
                }
                mainContentClassName={styles.mainContent}
                mainContent={
                    <React.Fragment>
                        <section className={styles.filters} >
                            <div className={styles.leadFilters}>
                                <div className={styles.leadAttributes}>
                                    <h4 className={styles.heading}>
                                        {_ts('export', 'leadAttributesLabel')}
                                    </h4>
                                    <FilterLeadsForm
                                        className={styles.leadsFilterForm}
                                        filterOnlyUnprotected={filterOnlyUnprotected}
                                    />
                                </div>
                                <div className={styles.leadsTableContainer}>
                                    { pendingLeads && <LoadingAnimation /> }
                                    <Table
                                        className={styles.leadsTable}
                                        data={leads}
                                        headers={this.headers}
                                        defaultSort={this.defaultSort}
                                        keySelector={Export.leadKeyExtractor}
                                    />
                                </div>
                            </div>
                            <div className={styles.entryFilters}>
                                <h4 className={styles.heading}>
                                    {_ts('export', 'entryAttributesLabel')}
                                </h4>
                                <FilterEntriesForm
                                    applyOnChange
                                    pending={pendingAf || pendingGeoOptions}
                                    filters={filters}
                                    geoOptions={geoOptions}
                                />
                            </div>
                        </section>
                        <ExportTypePane
                            activeExportTypeKey={activeExportTypeKey}
                            reportStructure={reportStructure}
                            decoupledEntries={decoupledEntries}
                            onExportTypeChange={this.handleExportTypeSelectButtonClick}
                            onReportStructureChange={this.handleReportStructureChange}
                            onDecoupledEntriesChange={this.handleDecoupledEntriesChange}
                            analysisFramework={analysisFramework}
                        />
                        <ExportPreview
                            className={styles.preview}
                            exportId={previewId}
                        />
                    </React.Fragment>
                }
            />
        );
    }
}
