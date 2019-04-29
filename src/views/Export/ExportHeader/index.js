import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '@togglecorp/fujs';
import { FgRestBuilder } from '#rsu/rest';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';

import { processEntryFilters } from '#entities/entries';
import Cloak from '#components/general/Cloak';
import {
    urlForExportTrigger,
    createParamsForExportTrigger,
} from '#rest';
import {
    pathNames,
    viewsAcl,
} from '#constants';
import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

const emptyList = [];

const createReportStructureForExport = nodes => nodes
    .filter(node => node.selected)
    .map(node => (
        node.nodes ? {
            id: node.key,
            levels: createReportStructureForExport(node.nodes),
        } : {
            id: node.key,
        }
    ));


const propTypes = {
    className: PropTypes.string,
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectedLeads: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onPreview: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    reportStructure: undefined,
    selectedLeads: {},
    entriesFilters: {},
};

const EXPORT_TYPE = {
    assessmentExport: 'assessment-export',
    entriesExport: 'entries-export',
    entriesPreview: 'entries-preview',
};

export default class ExportHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            exportPending: false,
            exportClass: undefined,
        };
    }

    componentWillUnmount() {
        if (this.exportRequest) {
            this.exportRequest.stop();
        }
    }

    export = ({ onSuccess, isPreview = false, exportItem = 'entry' }) => {
        // Let's start by collecting the filters
        const {
            projectId,
            entriesFilters,
            activeExportTypeKey,
            selectedLeads,
            reportStructure,
            decoupledEntries,
        } = this.props;

        const isWord = activeExportTypeKey === 'word';
        const isPdf = activeExportTypeKey === 'pdf';

        const exportType = (
            (exportItem === 'assessment' && 'excel')
            || ((isWord || isPdf) && 'report')
            || activeExportTypeKey
        );

        const exportClass = (
            (isPreview && EXPORT_TYPE.entriesPreview)
            || (exportItem === 'entry' && EXPORT_TYPE.entriesExport)
            || (exportItem === 'assessement' && EXPORT_TYPE.assessmentExport)
            || undefined
        );

        console.warn(exportItem, exportClass);

        const otherFilters = {
            project: projectId,
            lead: Object.keys(selectedLeads).filter(l => selectedLeads[l]),

            export_type: exportType,
            // for excel
            decoupled: decoupledEntries,
            // for pdf or word
            report_structure: createReportStructureForExport(reportStructure || emptyList),
            // differentiate between pdf or word
            pdf: isPdf,

            // entry or assessment
            export_item: exportItem,

            // temporary or permanent
            is_preview: isPreview,
        };

        const processedFilters = processEntryFilters(
            entriesFilters,
            this.props.analysisFramework,
            this.props.geoOptions,
        );

        const filters = [
            ...Object.entries(otherFilters),
            ...processedFilters,
        ];

        if (this.exportRequest) {
            this.exportRequest.stop();
        }
        this.exportRequest = this.createRequestForExport({
            filters,
            onSuccess,
            exportClass,
        });
        this.exportRequest.start();
    }

    createRequestForExport = ({ filters, onSuccess, exportClass }) => {
        const exportRequest = new FgRestBuilder()
            .url(urlForExportTrigger)
            .params(() => createParamsForExportTrigger(filters))
            .preLoad(() => this.setState({ exportPending: true, exportClass }))
            .postLoad(() => this.setState({ exportPending: false, exportClass: undefined }))
            .success((response) => {
                // FIXME: write schema
                onSuccess(response.exportTriggered);
            })
            .build();
        return exportRequest;
    }

    handleExport = () => {
        const onSuccess = (exportId) => {
            console.log('Exporting to ', exportId);
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'exportStartedNotifyMessage'),
                duration: 15000,
            });
        };
        this.export({ onSuccess });
    }

    handleAssessmentExportClick = () => {
        const onSuccess = (exportId) => {
            console.log('Exporting to ', exportId);
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'exportStartedNotifyMessage'),
                duration: 15000,
            });
        };

        this.export({ onSuccess, exportItem: 'assessment' });
    }

    handlePreview = () => {
        const { onPreview } = this.props;
        this.export({ onSuccess: onPreview, isPreview: true });
    }

    render() {
        const {
            projectId,
            className,
            pending,
        } = this.props;
        const {
            exportPending,
            exportClass,
        } = this.state;

        const classNames = `${styles.header} ${className}`;

        return (
            <header className={classNames}>
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
                        onClick={this.handlePreview}
                        disabled={pending || exportPending}
                        pending={exportClass === EXPORT_TYPE.entriesPreview}
                    >
                        {_ts('export', 'showPreviewButtonLabel')}
                    </Button>
                    <Cloak
                        // NOTE: this is temporary, will be moved to new page
                        {...viewsAcl.arys}
                        render={
                            <AccentButton
                                className={styles.button}
                                onClick={this.handleAssessmentExportClick}
                                disabled={pending || exportPending}
                                pending={exportClass === EXPORT_TYPE.assessmentExport}
                            >
                                {_ts('export', 'startAssessmentExportButtonLabel')}
                            </AccentButton>
                        }
                    />
                    <PrimaryButton
                        className={styles.button}
                        onClick={this.handleExport}
                        disabled={pending || exportPending}
                        pending={exportClass === EXPORT_TYPE.entriesExport}
                    >
                        {_ts('export', 'startExportButtonLabel')}
                    </PrimaryButton>
                </div>
            </header>
        );
    }
}
