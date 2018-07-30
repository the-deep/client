import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BoundError from '#rscg/BoundError';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import ForceDirectedGraph from '#rscz/NewForceDirectedGraph';
import wrapViz from '#rscz/VizWrapper';

import {
    reverseRoute,
    mapToList,
    groupList,
} from '#rsu/common';

import VizError from '#components/VizError';
import AppError from '#components/AppError';

import _ts from '#ts';

import {
    forceDirectedDataSelector,
    projectClusterDataSelector,
    projectIdFromRouteSelector,
    setProjectClusterDataAction,
} from '#redux';
import { pathNames } from '#constants/';

import ProjectClusterDataRequest from './requests/ProjectClusterDataRequest';
import InitProjectClusterRequest from './requests/InitProjectClusterRequest';
import LeadInfoForDocumentRequest from './requests/LeadInfoForDocumentRequest';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    projectClusterData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectClusterData: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: projectIdFromRouteSelector(state),
    forcedDirectedData: forceDirectedDataSelector(state),
    projectClusterData: projectClusterDataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectClusterData: params => dispatch(setProjectClusterDataAction(params)),
});

const ForceDirectedGraphView = BoundError(VizError)(wrapViz(ForceDirectedGraph));

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class ClusterViz extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getMaxNode = data => data.reduce((previous, current) => (
        current.score > previous.score ? current : previous
    ))

    static idAccessor = d => d.id;
    static groupAccessor = d => d.group;
    static valueAccessor = d => d.value;

    static getTableKey = data => data.id;
    static keywordTableKeyExtractor = row => row.value;
    static documentTableKeyExtractor = row => row.id;

    static calculateNodesAndLinks = (projectClusterData) => {
        const keywords = projectClusterData.keywords || [];
        const documents = projectClusterData.documents || [];

        const clusterGroup = groupList(keywords, d => d.cluster);

        const nodes = keywords.map(cluster => ({
            id: cluster.value + cluster.cluster,
            label: cluster.value,
            group: cluster.cluster,
            radius: cluster.score,
        }));

        const maxNodes = Object.entries(clusterGroup)
            .map(([key, value]) => ({
                id: key,
                node: ClusterViz.getMaxNode(value),
            }));

        const mappingFn = ([key, value]) => {
            const target = maxNodes.find(node => node.id === key) || {};
            const source = value.filter(node => (target.node || {}).value !== node.value);
            return source.map(node => ({
                source: node.value + node.cluster,
                target: target.node.value + target.node.cluster,
                value: 1,
            }));
        };

        // NOTE: Unflatten array using Array.concat(...arrayOfArray)
        const links = [].concat(...Object.entries(clusterGroup).map(mappingFn));
        const clusterGroupList = mapToList(
            clusterGroup,
            (data, key) => (
                {
                    id: key,
                    clusters: data,
                    documents: documents[key],
                }
            ),
        );

        return { nodesAndLinks: { links, nodes }, clusterGroupList };
    }

    constructor(props) {
        super(props);
        this.state = {
            clusterSize: 5,
            createClusterPending: true,
            clusterDataPending: true,
            highlightClusterId: undefined,
        };

        this.container = React.createRef();
    }

    componentWillMount() {
        this.startRequestForInitCluster();

        const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
            this.props.projectClusterData,
        );
        this.nodesAndLinks = nodesAndLinks;
        this.clusterGroupList = clusterGroupList;
        this.noOfClusters = clusterGroupList.length;
        this.noOfLeads = clusterGroupList
            .map(cluster => cluster.documents.length)
            .reduce((sum, val) => sum + val, 0);
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject: newActiveProject,
            projectClusterData: newProjectClusterData,
        } = nextProps;
        const {
            activeProject: oldActiveProject,
            projectClusterData: oldProjectClusterData,
        } = this.props;

        if (newActiveProject !== oldActiveProject) {
            this.startRequestForInitCluster(newActiveProject, 5);
        }
        if (newProjectClusterData !== oldProjectClusterData) {
            const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
                newProjectClusterData,
            );
            this.nodesAndLinks = nodesAndLinks;
            this.clusterGroupList = clusterGroupList;
        }
    }

    componentDidUpdate() {
        const { current: container } = this.container;

        const activeClusterDetails = container.getElementsByClassName(styles.activeCluster);
        if (activeClusterDetails.length > 0) {
            activeClusterDetails[0].scrollIntoView({
                behaviour: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }

    componentWillUnmount() {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
    }

    getClusterDetailClassName = (isActive) => {
        const classNames = [
            styles.clusterDetail,
        ];

        if (isActive) {
            classNames.push(styles.activeCluster);
        }

        return classNames.join(' ');
    }

    handleClusterSizeChange = (value) => {
        this.setState({ clusterSize: Number(value) });
    }

    startRequestForInitCluster = () => {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
        const { activeProject } = this.props;
        const { stopRequestForClusterData, startRequestForClusterData } = this;

        const noOfClusters = 5;

        const createClusterRequest = new InitProjectClusterRequest({
            stopRequestForClusterData,
            startRequestForClusterData,
            setState: params => this.setState(params),
        });
        this.createClusterRequest = createClusterRequest.create(activeProject, noOfClusters);
        this.createClusterRequest.start();
    }

    startRequestForClusterData = (modelId, projectId) => {
        if (modelId) {
            const clusterDataRequest = new ProjectClusterDataRequest({
                setProjectClusterData: this.props.setProjectClusterData,
                setState: params => this.setState(params),
            });
            this.clusterDataRequest = clusterDataRequest.create(modelId, projectId);
            this.clusterDataRequest.start();
        }
    }

    stopRequestForClusterData = () => {
        if (this.clusterDataRequest) {
            this.clusterDataRequest.stop();
        }
    }

    startRequestForLeadsData = (documents, projectId) => {
        this.stopRequestForLeadsData();
        const leadsDataRequest = new LeadInfoForDocumentRequest({
            setProjectClusterData: this.props.setProjectClusterData,
            setState: params => this.setState(params),
        });
        this.leadsDataRequest = leadsDataRequest.create(documents, projectId);
        this.leadsDataRequest.start();
    }

    stopRequestForLeadsData = () => {
        if (this.leadsDataRequest) {
            this.leadsDataRequest.stop();
        }
    }

    stopRequestForInitCluster = () => {
        if (this.createClusterRequest) {
            this.createClusterRequest.stop();
        }
    }

    handleKeywordMouseOver = (keyword) => {
        this.setState({ highlightClusterId: keyword });
    }

    handleKeywordMouseOut = () => {
        this.setState({ highlightClusterId: undefined });
    }

    handleMouseOver = (d) => {
        this.setState({ activeCluster: d });
    }

    handleMouseOut = () => {
        this.setState({ activeCluster: undefined });
    }

    renderKeyword = (_, cluster) => {
        const { activeCluster = {} } = this.state;
        const {
            value: keyword,
            cluster: clusterId,
        } = cluster;

        const classNames = [
            styles.keyword,
        ];

        const keywordId = `${keyword}-${clusterId}`;
        const activeClusterId = `${activeCluster.label}-${activeCluster.group}`;

        if (activeClusterId === keywordId) {
            classNames.push(styles.active);
        }

        const handleKeywordMouseOver = () => { this.handleKeywordMouseOver(keywordId); };

        return (
            // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
            <div
                onMouseOver={handleKeywordMouseOver}
                onMouseOut={this.handleKeywordMouseOut}
                key={keyword}
                className={classNames.join(' ')}
            >
                { keyword }
            </div>
        );
    }

    renderLead = (_, lead) => {
        const {
            title,
            id,
        } = lead;

        return (
            <div
                key={id}
                className={styles.lead}
                title={title}
            >
                { title }
            </div>
        );
    }

    renderClusterDetail = (key, data) => {
        const { activeCluster } = this.state;
        const isActive = activeCluster && String(activeCluster.group) === String(data.id);

        const className = this.getClusterDetailClassName(isActive);
        const clusterIndex = Number(key) + 1;

        const {
            clusters,
            documents,
        } = data;

        const leadsCount = documents.length;

        const headingText = _ts(
            'clusterViz',
            'clusterHeader',
            { clusterIndex },
        );

        const leadsCountText = _ts(
            'clusterViz',
            'leadsCount',
            {
                leadsCount: (
                    <div className={styles.number}>
                        {leadsCount}
                    </div>
                ),
            },
        );

        const leadsEmptyComponent = () => (
            <div className={styles.leadsEmpty}>
                -
            </div>
        );

        return (
            <div
                className={className}
                key={key}
            >
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        { headingText }
                    </h3>
                    <div className={styles.leadsCount}>
                        { leadsCountText }
                    </div>
                </header>
                <div className={styles.keywordList}>
                    <h5 className={styles.heading}>
                        {_ts('clusterViz', 'keywordsTitle')}
                    </h5>
                    <ListView
                        data={clusters}
                        className={styles.keywords}
                        modifier={this.renderKeyword}
                    />
                </div>
                <div className={styles.leadList}>
                    <h5 className={styles.heading}>
                        {_ts('clusterViz', 'leadsTitle')}
                    </h5>
                    <ListView
                        data={documents}
                        className={styles.leads}
                        modifier={this.renderLead}
                        emptyComponent={leadsEmptyComponent}
                    />
                </div>
            </div>
        );
    }

    render() {
        const {
            clusterSize,
            createClusterPending,
            clusterDataPending,
            highlightClusterId,
        } = this.state;

        const {
            className: classNameFromProps,
            activeProject,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.cluster}
        `;

        const loading = createClusterPending || clusterDataPending;

        return (
            <div
                ref={this.container}
                className={className}
            >
                <header className={styles.header}>
                    <h2>{_ts('clusterViz', 'clusterVizTitle')}</h2>
                </header>
                <div className={styles.container}>
                    {loading && <LoadingAnimation />}
                    {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        data={this.nodesAndLinks}
                        idAccessor={ClusterViz.idAccessor}
                        groupAccessor={ClusterViz.groupAccessor}
                        valueAccessor={ClusterViz.valueAccessor}
                        highlightClusterId={highlightClusterId}
                        useVoronoi
                        headerText={
                            _ts(
                                'clusterViz',
                                'clusterTitle',
                                { noOfClusters: this.noOfClusters, noOfLeads: this.noOfLeads },
                            )
                        }
                        onMouseOver={d => this.handleMouseOver(d)}
                        onMouseOut={() => this.handleMouseOut}
                        clusterSize={clusterSize}
                        onClusterSizeChange={this.handleClusterSizeChange}
                    />
                    <ListView
                        className={styles.clusterDetails}
                        data={this.clusterGroupList}
                        keyExtractor={ClusterViz.getTableKey}
                        modifier={this.renderClusterDetail}
                    />
                </div>
                <footer className={styles.footer}>
                    <Link
                        className={styles.link}
                        to={reverseRoute(pathNames.leads, { projectId: activeProject })}
                        replace
                    >
                        { _ts('clusterViz', 'showTable')}
                    </Link>
                </footer>
            </div>
        );
    }
}
