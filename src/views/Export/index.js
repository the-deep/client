import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import { listToMap } from '@togglecorp/fujs';

import Page from '#rscv/Page';
import update from '#rsu/immutable-update';
import ExportPreview from '#components/other/ExportPreview';
import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
    leadPageFilterSelector,
    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    geoOptionsForProjectSelector,
    activeProjectRoleSelector,
    entryFilterOptionsForProjectSelector,
} from '#redux';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';

import {
    SECTOR_FIRST,
    createReportStructure as createReportStructureFromUtils,
} from '#utils/framework';

import FilterLeadsForm from '#components/other/FilterLeadsForm';
import _ts from '#ts';

import FilterEntriesForm from '../Entries/FilterEntriesForm';

import ExportHeader from './ExportHeader';
import LeadsTable from './LeadsTable';
import ExportTypePane from './ExportTypePane';
import requestOptions from './request';
import styles from './styles.scss';

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    analysisFramework: analysisFrameworkForProjectSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    entryFilterOptions: entryFilterOptionsForProjectSelector(state),
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
    // eslint-disable-next-line react/no-unused-prop-types
    setAnalysisFramework: PropTypes.func.isRequired,
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entryFilterOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    projectRole: {},
    geoOptions: {},
    entryFilterOptions: {},
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportButtonKeyExtractor = d => d.key;
    static leadKeyExtractor = d => d.id

    constructor(props) {
        super(props);

        const {
            requests: { leadsGetRequest },
            analysisFramework,
        } = this.props;

        leadsGetRequest.setDefaultParams({
            setLeads: this.handleSelectedLeadsSet,
        });

        const reportStructure = this.createReportStructure(
            analysisFramework,
            SECTOR_FIRST,
        );

        const textWidgets = this.getTextWidgetsFromFramework(analysisFramework);

        this.state = {
            activeExportTypeKey: 'word',
            previewId: undefined,
            decoupledEntries: true,

            textWidgets,
            showGroups: true,
            reportStructure,
            reportStructureVariant: SECTOR_FIRST,

            selectedLeads: {},
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: newActiveProject,
            analysisFramework: newAnalysisFramework,
        } = nextProps;
        const {
            projectId: oldActiveProject,
            analysisFramework: oldAnalysisFramework,
        } = this.props;

        if (oldActiveProject !== newActiveProject) {
            // Reset everything
            this.setState({
                activeExportTypeKey: 'word',
                previewId: undefined,
                reportStructure: undefined,
                decoupledEntries: true,

                selectedLeads: {},
            });
        }
        if (newAnalysisFramework !== oldAnalysisFramework) {
            const { reportStructureVariant } = this.state;
            this.setState({
                reportStructure: this.createReportStructure(
                    newAnalysisFramework,
                    reportStructureVariant,
                ),
            });
        }
    }

    getTextWidgetsFromFramework = ({ widgets } = {}) => {
        if (!widgets) {
            return [];
        }
        const textWidgets = widgets
            .filter(w => w.widgetId === 'textWidget')
            .map(w => ({
                title: w.title,
                key: w.key,
                id: w.id,
                selected: true,
                draggable: true,
            }));

        const textWidgetsInsideConditionals = widgets
            .filter(w => w.widgetId === 'conditionalWidget')
            .map((conditional) => {
                const {
                    title,
                    id,
                    properties: {
                        data: {
                            widgets: widgetsInsideConditional = [],
                        } = {},
                    } = {},
                } = conditional;

                return widgetsInsideConditional
                    .filter(w => w.widget && w.widget.widgetId === 'textWidget')
                    .map(({ widget }) => (
                        {
                            id: widget.key,
                            title: `${title} › ${widget.title}`,
                            actualTitle: widget.title,
                            conditionalId: id,
                            isConditional: true,
                            selected: true,
                            draggable: true,
                        }
                    ));
            }).flat();

        return [...textWidgets, ...textWidgetsInsideConditionals];
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

    handleShowGroupsChange = (showGroups) => {
        this.setState({ showGroups });
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

    handleSelectAllLeads = (selectAll) => {
        const {
            leads: leadsFromState = [],
        } = this.state;

        const selectedLeads = listToMap(
            leadsFromState,
            d => d.id,
            () => selectAll,
        );

        const leads = leadsFromState.map(l => ({
            ...l,
            selected: selectAll,
        }));

        this.setState({
            leads,
            selectedLeads,
        });
    }

    createReportStructure = memoize(createReportStructureFromUtils)

    handleReportStructureChange = (value) => {
        this.setState({ reportStructure: value });
    }

    handleTextWidgetsSelection = (textWidgets) => {
        this.setState({ textWidgets });
    }

    handleReportStructureVariantChange = (value) => {
        const { analysisFramework } = this.props;

        this.setState({
            reportStructureVariant: value,
            reportStructure: this.createReportStructure(
                analysisFramework,
                value,
            ),
        });
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
            reportStructureVariant,
            decoupledEntries,
            selectedLeads,
            textWidgets,
            showGroups,
            leads = [],
        } = this.state;

        const {
            analysisFramework = {},
            entriesFilters,
            projectId,
            geoOptions,
            entryFilterOptions,
            projectRole: {
                exportPermissions: {
                    create_only_unprotected: filterOnlyUnprotected,
                } = {},
            },
            requests: {
                leadsGetRequest: { pending: pendingLeads },
                analysisFrameworkRequest: { pending: pendingAf },
                geoOptionsRequest: { pending: pendingGeoOptions },
            },
        } = this.props;

        const { filters } = analysisFramework;

        return (
            <Page
                className={styles.export}
                header={
                    <ExportHeader
                        projectId={projectId}
                        entriesFilters={entriesFilters}
                        activeExportTypeKey={activeExportTypeKey}
                        selectedLeads={selectedLeads}
                        reportStructure={reportStructure}
                        decoupledEntries={decoupledEntries}
                        onPreview={this.handlePreview}
                        showGroups={showGroups}
                        pending={pendingLeads || pendingAf || pendingGeoOptions}
                        analysisFramework={analysisFramework}
                        geoOptions={geoOptions}
                        textWidgets={textWidgets}
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
                                <LeadsTable
                                    className={styles.leadsTable}
                                    pending={pendingLeads}
                                    leads={leads}
                                    onSelectLeadChange={this.handleSelectLeadChange}
                                    onSelectAllClick={this.handleSelectAllLeads}
                                />
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
                            textWidgets={textWidgets}
                            reportStructureVariant={reportStructureVariant}
                            decoupledEntries={decoupledEntries}
                            onExportTypeChange={this.handleExportTypeSelectButtonClick}
                            onReportStructureChange={this.handleReportStructureChange}
                            onTextWidgetsChange={this.handleTextWidgetsSelection}
                            entryFilterOptions={entryFilterOptions}
                            showGroups={showGroups}
                            onShowGroupsChange={this.handleShowGroupsChange}
                            onReportStructureVariantChange={this.handleReportStructureVariantChange}
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
