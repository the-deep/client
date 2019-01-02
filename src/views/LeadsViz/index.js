import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import {
    reverseRoute,
    isObjectEmpty,
} from '#rsu/common';

import BoundError from '#rscg/BoundError';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import Page from '#rscv/Page';
import ChordDiagram from '#rscz/ChordDiagram';
import CollapsibleTree from '#rscz/CollapsibleTree';
import CorrelationMatrix from '#rscz/CorrelationMatrix';
import ForceDirectedGraph from '#rscz/ForceDirectedGraph';
import GeoReferencedMap from '#rscz/GeoReferencedMap';
import RadialDendrogram from '#rscz/RadialDendrogram';
import SunBurst from '#rscz/SunBurst';
import wrapViz from '#rscz/VizWrapper';
import ZoomableTreeMap from '#rscz/ZoomableTreeMap';
import {
    projectDetailsSelector,
    leadPageFilterSelector,

    setLeadVisualizationAction,
    hierarchialDataSelector,
    chordDataSelector,
    correlationDataSelector,
    forceDirectedDataSelector,
    geoPointsDataSelector,
} from '#redux';
import { pathNames } from '#constants/';

import VizError from '#components/error/VizError';
import BackLink from '#components/general/BackLink';

import _ts from '#ts';
import _cs from '#cs';

import LeadKeywordCorrelationRequest from './requests/LeadKeywordCorrelationRequest';
import LeadTopicCorrelationRequest from './requests/LeadTopicCorrelationRequest';
import LeadTopicModelingRequest from './requests/LeadTopicModelingRequest';
import LeadCDIdRequest from './requests/LeadCDIdRequest';
import LeadNerRequest from './requests/LeadNerRequest';

import FilterLeadsForm from '../Leads/FilterLeadsForm';
import styles from './styles.scss';

// FIXME: looks like activeProject is not needed here, projectId would do
const propTypes = {
    activeProject: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
    }).isRequired,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    hierarchicalData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    correlationData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    chordData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    forceDirectedData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoPointsData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setLeadVisualization: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    activeProject: projectDetailsSelector(state),
    filters: leadPageFilterSelector(state),
    hierarchicalData: hierarchialDataSelector(state),
    chordData: chordDataSelector(state),
    correlationData: correlationDataSelector(state),
    forceDirectedData: forceDirectedDataSelector(state),
    geoPointsData: geoPointsDataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadVisualization: parms => dispatch(setLeadVisualizationAction(parms)),
});

const decorate = component => BoundError(VizError)(wrapViz(component));

const ChordDiagramView = decorate(ChordDiagram);
const SunBurstView = decorate(SunBurst);
const CorrelationMatrixView = decorate(CorrelationMatrix);
const RadialDendrogramView = decorate(RadialDendrogram);
const TreeMapView = decorate(ZoomableTreeMap);
const ForceDirectedGraphView = decorate(ForceDirectedGraph);
const CollapsibleTreeView = decorate(CollapsibleTree);

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadsViz extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static sizeValueSelector = d => d.size;
    static labelValueSelector = d => d.name;
    static groupValueSelector = d => d.group;
    static valueSelector = d => d.value;

    constructor(props) {
        super(props);

        this.state = {
            noLeadsFound: false,
            loadingLeads: true,
            hierarchicalDataPending: true,
            chordDataPending: true,
            correlationDataPending: true,
            forceDirectedDataPending: true,
            geoPointsDataPending: true,
        };
    }

    componentWillMount() {
        this.startRequestForLeadCDId();
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.filters !== this.props.filters ||
            nextProps.activeProject.id !== this.props.activeProject.id
        ) {
            if (this.leadCDIdRequest) {
                this.leadCDIdRequest.stop();
            }
            this.stopNlpRequests();

            this.startRequestForLeadCDId(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.leadCDIdRequest) {
            this.leadCDIdRequest.stop();
        }
        this.stopNlpRequests();
    }

    startNlpRequests = (docIds = []) => {
        const noLeadsFound = docIds.length <= 0;
        this.setState({ noLeadsFound });
        if (!noLeadsFound) {
            this.startRequestForLeadTopicModeling(docIds);
            this.startRequestForLeadNer(docIds);
            this.startRequestForLeadTopicCorrelation(docIds);
            this.startRequestForLeadKeywordCorrelationRequest(docIds);
        }
    }

    stopNlpRequests = () => {
        if (this.leadTopicModelingRequest) {
            this.leadTopicModelingRequest.stop();
        }
        if (this.leadNerRequest) {
            this.leadNerRequest.stop();
        }
        if (this.leadTopicCorrelationRequest) {
            this.leadTopicCorrelationRequest.stop();
        }
        if (this.leadKeywordCorrelationRequest) {
            this.leadKeywordCorrelationRequest.stop();
        }
    }

    startRequestForLeadCDId = (props = this.props) => {
        if (this.leadCDIdRequest) {
            this.leadCDIdRequest.stop();
        }
        const { activeProject, filters } = props;
        const { stopNlpRequests, startNlpRequests } = this;
        const leadCDIdRequest = new LeadCDIdRequest({
            stopNlpRequests,
            startNlpRequests,
            setState: params => this.setState(params),
        });
        this.leadCDIdRequest = leadCDIdRequest.create({ activeProject, filters });
        this.leadCDIdRequest.start();
    }

    startRequestForLeadTopicModeling = (docIds, props = this.props) => {
        if (this.leadTopicModelingRequest) {
            this.leadTopicModelingRequest.stop();
        }
        const { activeProject } = props;
        const leadTopicModelingRequest = new LeadTopicModelingRequest({
            setLeadVisualization: this.props.setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadTopicModelingRequest = leadTopicModelingRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadTopicModelingRequest.start();
    }

    startRequestForLeadNer = (docIds, props = this.props) => {
        if (this.leadNerRequest) {
            this.leadNerRequest.stop();
        }
        const { activeProject, setLeadVisualization } = props;
        const leadNerRequest = new LeadNerRequest({
            setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadNerRequest = leadNerRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadNerRequest.start();
    }

    startRequestForLeadTopicCorrelation = (docIds, props = this.props) => {
        if (this.leadTopicCorrelationRequest) {
            this.leadTopicCorrelationRequest.stop();
        }
        const { activeProject, setLeadVisualization } = props;
        const leadTopicCorrelationRequest = new LeadTopicCorrelationRequest({
            setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadTopicCorrelationRequest = leadTopicCorrelationRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadTopicCorrelationRequest.start();
    }

    startRequestForLeadKeywordCorrelationRequest = (docIds, props = this.props) => {
        if (this.leadKeywordCorrelationRequest) {
            this.leadKeywordCorrelationRequest.stop();
        }
        const { activeProject, setLeadVisualization } = props;
        const leadKeywordCorrelationRequest = new LeadKeywordCorrelationRequest({
            setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadKeywordCorrelationRequest = leadKeywordCorrelationRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadKeywordCorrelationRequest.start();
    }

    renderNoLeadFound = () => (
        <Message className={styles.noLeadsMessage}>
            <h3 className={styles.heading}>
                { _ts('leadsViz', 'noLeadsFoundHeader') }
            </h3>
            <p>
                { _ts('leadsViz', 'noLeadsFoundDescription') }
            </p>
        </Message>
    )

    renderCharts = () => {
        const {
            chordData,
            hierarchicalData,
            correlationData,
            forceDirectedData,
            geoPointsData,
        } = this.props;
        const {
            hierarchicalDataPending,
            chordDataPending,
            correlationDataPending,
            forceDirectedDataPending,
            geoPointsDataPending,
        } = this.state;

        return (
            <Fragment>
                <GeoReferencedMap
                    className={`${styles.geoReferencedMap} ${styles.viz}`}
                    vizContainerClass={styles.chartContainer}
                    loading={geoPointsDataPending}
                    geoPoints={geoPointsData.points}
                />
                <TreeMapView
                    className={`${styles.treeMap} ${styles.viz}`}
                    data={hierarchicalData}
                    vizContainerClass={styles.chartContainer}
                    loading={hierarchicalDataPending}
                    headerText={_ts('leadsViz', 'treeMap')}
                    valueSelector={LeadsViz.sizeValueSelector}
                    labelSelector={LeadsViz.labelValueSelector}
                />
                <SunBurstView
                    className={`${styles.sunBurst} ${styles.viz}`}
                    data={hierarchicalData}
                    vizContainerClass={styles.chartContainer}
                    loading={hierarchicalDataPending}
                    headerText={_ts('leadsViz', 'sunburst')}
                    valueSelector={LeadsViz.sizeValueSelector}
                    labelSelector={LeadsViz.labelValueSelector}
                />
                <ChordDiagramView
                    className={`${styles.chordDiagram} ${styles.viz}`}
                    data={chordData.values}
                    loading={chordDataPending}
                    headerText={_ts('leadsViz', 'chordDiagram')}
                    vizContainerClass={styles.chartContainer}
                    labelsData={chordData.labels}
                    valueSelector={LeadsViz.sizeValueSelector}
                    labelSelector={LeadsViz.labelValueSelector}
                />
                <CorrelationMatrixView
                    className={`${styles.correlationMatrix} ${styles.viz}`}
                    data={correlationData}
                    colorSchemeType="continuous"
                    headerText={_ts('leadsViz', 'correlationMatrix')}
                    loading={correlationDataPending}
                    vizContainerClass={styles.chartContainer}
                />
                <ForceDirectedGraphView
                    className={`${styles.forceDirectedGraph} ${styles.viz}`}
                    data={forceDirectedData}
                    loading={forceDirectedDataPending}
                    headerText={_ts('leadsViz', 'forcedDirectedGraph')}
                    vizContainerClass={styles.chartContainer}
                    idSelector={d => d.id}
                    groupSelector={LeadsViz.groupValueSelector}
                    valueSelector={LeadsViz.valueSelector}
                    useVoronoi={false}
                />
                <CollapsibleTreeView
                    className={`${styles.collapsibleTree} ${styles.viz}`}
                    headerText={_ts('leadsViz', 'collapsibleTreeView')}
                    data={hierarchicalData}
                    loading={hierarchicalDataPending}
                    vizContainerClass={styles.chartContainer}
                    labelSelector={LeadsViz.labelValueSelector}
                />
                <RadialDendrogramView
                    className={`${styles.radialDendrogram} ${styles.viz}`}
                    headerText={_ts('leadsViz', 'radialDendogram')}
                    data={hierarchicalData}
                    loading={hierarchicalDataPending}
                    vizContainerClass={styles.chartContainer}
                    labelSelector={LeadsViz.labelValueSelector}
                />
            </Fragment>
        );
    }

    renderContent = () => {
        const {
            noLeadsFound,
            loadingLeads,
        } = this.state;

        if (loadingLeads) {
            return <LoadingAnimation />;
        } else if (noLeadsFound) {
            return this.renderNoLeadFound();
        }

        return this.renderCharts();
    }

    render() {
        const {
            activeProject,
            className,
        } = this.props;

        const exitPath = reverseRoute(pathNames.leads, { projectId: activeProject.id });
        const MainContent = this.renderContent;

        return (
            <Page
                className={_cs(styles.leadsVisualization, className)}
                headerClassName={styles.header}
                header={
                    <React.Fragment>
                        <BackLink
                            defaultLink={exitPath}
                            className={styles.backLink}
                        />
                        <FilterLeadsForm className={styles.filters} />
                    </React.Fragment>
                }
                mainContentClassName={styles.mainContent}
                mainContent={<MainContent />}
            />
        );
    }
}
