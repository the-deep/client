import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { processEntryFilters } from '#entities/entries';
import Cloak from '#components/general/Cloak';
import {
    pathNames,
    viewsAcl,
} from '#constants';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

const emptyList = [];

const createReportStructureForExport = (nodes = emptyList) => (
    nodes
        .filter(node => node.selected)
        .map(node => ({
            id: node.key,
            levels: node.nodes
                ? createReportStructureForExport(node.nodes)
                : undefined,
        }))
);

const createReportStructureLevelForExport = (nodes = emptyList) => (
    nodes
        .filter(node => node.selected)
        .map(node => ({
            id: node.key,
            title: node.title,
            sublevels: node.nodes
                ? createReportStructureLevelForExport(node.nodes)
                : undefined,
        }))
);

const createWidgetIds = widgets => (
    widgets
        .filter(widget => widget.selected)
        .map((widget) => {
            if (widget.isConditional) {
                return ([
                    widget.conditionalId,
                    widget.id,
                    widget.actualTitle,
                ]);
            }
            return widget.id;
        })
);

const EXPORT_CLASS = {
    assessmentExport: 'assessment-export',
    entriesExport: 'entries-export',
    entriesPreview: 'entries-preview',
};

const EXPORT_ITEM = {
    assessment: 'assessment',
    plannedAssessment: 'planned_assessment',
    entry: 'entry',
};

const propTypes = {
    className: PropTypes.string,
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    textWidgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    contextualWidgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectedLeads: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onPreview: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
    showGroups: PropTypes.bool.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    reportStructure: undefined,
    textWidgets: [],
    contextualWidgets: [],
    selectedLeads: {},
    entriesFilters: {},
    geoOptions: {},
};

const requestOptions = {
    exportRequest: {
        url: '/export-trigger/',
        method: methods.POST,
        body: ({ params: { filters } }) => ({ filters }),
        onSuccess: ({
            props: { onPreview },
            params: {
                setExportClass,
                isPreview,
                exportItem,
            },
            response: { exportTriggered },
        }) => {
            if (isPreview) {
                onPreview(exportTriggered);
            } else if (exportItem === EXPORT_ITEM.entry) {
                notify.send({
                    title: _ts('export', 'headerExport'),
                    type: notify.type.SUCCESS,
                    message: _ts('export', 'exportStartedNotifyMessage'),
                    duration: 15000,
                });
            } else if (exportItem === EXPORT_ITEM.assessment) {
                notify.send({
                    title: _ts('export', 'headerExport'),
                    type: notify.type.SUCCESS,
                    message: _ts('export', 'exportStartedNotifyMessage'),
                    duration: 15000,
                });
            }

            setExportClass(undefined);
        },
        onFailure: ({ params }) => {
            params.setExportClass(undefined);
        },
        onFatal: ({ params }) => {
            params.setExportClass(undefined);
        },
    },
};

@RequestCoordinator
@RequestClient(requestOptions)
export default class ExportHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // NOTE: just saving this to identify which button is pressed:
            // - entry export
            // - entry preview
            // - assessment export
            exportClass: undefined,
        };
    }

    setExportClass = (exportClass) => {
        this.setState({ exportClass });
    }

    export = (isPreview, exportItem) => {
        const {
            projectId,
            entriesFilters,
            activeExportTypeKey,
            selectedLeads,
            reportStructure: struct,
            decoupledEntries,
            analysisFramework,
            geoOptions,
            textWidgets,
            contextualWidgets,
            showGroups,
            requests: {
                exportRequest,
            },
        } = this.props;

        const isWord = activeExportTypeKey === 'word';
        const isPdf = activeExportTypeKey === 'pdf';

        const exportType = (
            (exportItem === EXPORT_ITEM.assessment && 'excel')
            || (exportItem === EXPORT_ITEM.plannedAssessment && 'excel')
            || ((isWord || isPdf) && 'report')
            || activeExportTypeKey
        );
        // NOTE: structure and level depict the same thing but are different in structure
        // levels require the sublevels to be named sublevels whereas structure requires
        // sublevels to be names levels
        // This cannot be fixed immediately in server as it requires migration
        const reportLevels = createReportStructureLevelForExport(struct)
            .map(node => ({
                id: node.id,
                levels: node.sublevels,
            }));
        const reportStructure = createReportStructureForExport(struct);
        const textWidgetIds = createWidgetIds(textWidgets);
        let contextualWidgetIds;
        if (isWord || isPdf) {
            contextualWidgetIds = createWidgetIds(contextualWidgets);
        }

        const otherFilters = {
            project: projectId,
            lead: Object.keys(selectedLeads).filter(l => selectedLeads[l]),

            export_type: exportType,
            // NOTE: export_type for 'word' and 'pdf' is report so, we need to differentiate
            pdf: isPdf,

            // for excel
            decoupled: decoupledEntries,

            // for pdf or word
            report_levels: reportLevels,
            report_structure: reportStructure,
            text_widget_ids: textWidgetIds,
            show_groups: showGroups,

            // entry or assessment
            export_item: exportItem,

            // temporary or permanent
            is_preview: isPreview,

            // for word
            exporting_widgets: contextualWidgetIds,
        };

        const processedFilters = processEntryFilters(
            entriesFilters,
            analysisFramework,
            geoOptions,
        );

        const filters = [
            ...Object.entries(otherFilters),
            ...processedFilters,
        ];

        exportRequest.do({
            setExportClass: this.setExportClass,
            filters,
            isPreview,
            exportItem,
        });

        const exportClass = (
            (isPreview && EXPORT_CLASS.entriesPreview)
            || (exportItem === EXPORT_ITEM.entry && EXPORT_CLASS.entriesExport)
            || (exportItem === EXPORT_ITEM.assessment && EXPORT_CLASS.assessmentExport)
            || undefined
        );
        this.setState({ exportClass });
    }

    handleAssessmentExportClick = () => {
        this.export(false, EXPORT_ITEM.assessment);
    }

    handlePlannedAssessmentExportClick = () => {
        this.export(false, EXPORT_ITEM.plannedAssessment);
    }

    handleEntryExport = () => {
        this.export(false, EXPORT_ITEM.entry);
    }

    handleEntryPreview = () => {
        // NOTE: resetting preview
        const { onPreview } = this.props;
        onPreview(undefined);

        this.export(true, EXPORT_ITEM.entry);
    }

    render() {
        const {
            projectId,
            className,
            pending,
            requests: {
                exportRequest: {
                    pending: exportPending,
                },
            },
        } = this.props;

        const { exportClass } = this.state;

        return (
            <header className={_cs(styles.header, className)}>
                <h2>
                    {_ts('export', 'headerExport')}
                </h2>
                <div className={styles.actionButtons}>
                    <Link
                        to={reverseRoute(pathNames.userExports, { projectId })}
                        className={styles.link}
                    >
                        {_ts('export', 'viewAllExportsButtonLabel')}
                    </Link>
                    <Button
                        className={styles.button}
                        onClick={this.handleEntryPreview}
                        disabled={pending}
                        pending={exportPending && exportClass === EXPORT_CLASS.entriesPreview}
                    >
                        {_ts('export', 'showPreviewButtonLabel')}
                    </Button>
                    <PrimaryButton
                        className={styles.button}
                        onClick={this.handleEntryExport}
                        disabled={pending}
                        pending={exportPending && exportClass === EXPORT_CLASS.entriesExport}
                    >
                        {_ts('export', 'startExportButtonLabel')}
                    </PrimaryButton>
                    <Cloak
                        // NOTE: this is temporary, will be moved to new page
                        {...viewsAcl.arys}
                        render={
                            <PrimaryButton
                                className={styles.button}
                                onClick={this.handleAssessmentExportClick}
                                disabled={pending}
                                pending={
                                    exportPending && exportClass === EXPORT_CLASS.assessmentExport
                                }
                            >
                                {_ts('export', 'startAssessmentExportButtonLabel')}
                            </PrimaryButton>
                        }
                    />
                    <Cloak
                        // NOTE: this is temporary, will be moved to new page
                        {...viewsAcl.arys}
                        render={
                            <PrimaryButton
                                className={styles.button}
                                onClick={this.handlePlannedAssessmentExportClick}
                                disabled={pending}
                                pending={
                                    exportPending && exportClass === EXPORT_CLASS.assessmentExport
                                }
                            >
                                {_ts('export', 'startPlannedAssessmentExportButtonLabel')}
                            </PrimaryButton>
                        }
                    />
                </div>
            </header>
        );
    }
}
