import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BoundError from '#rs/components/General/BoundError';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Table from '#rs/components/View/Table';
import FormattedDate from '#rs/components/View/FormattedDate';
import ListView from '#rs/components/View/List/ListView';
import ForceDirectedGraph from '#rs/components/Visualization/NewForceDirectedGraph';
import wrapViz from '#rs/components/Visualization/VizWrapper';

import {
    reverseRoute,
    mapToList,
    groupList,
} from '#rs/utils/common';

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
        };
        this.keywordHeader = [
            {
                key: 'value',
                label: _ts('clusterViz', 'keywordTableValueLabel'),
                order: 1,
            },
            {
                key: 'score',
                label: _ts('clusterViz', 'keywordTableScoreLabel'),
                order: 2,
            },
        ];

        this.documentHeader = [
            {
                key: 'title',
                label: _ts('clusterViz', 'documentTableTitleLabel'),
                order: 1,
            },
            {
                key: 'createdAt',
                label: _ts('clusterViz', 'documentTableCreatedAtLabel'),
                order: 3,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
        ];

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

        const activeClusterTables = container.getElementsByClassName(styles.activeCluster);
        if (activeClusterTables.length > 0) {
            activeClusterTables[0].scrollIntoView({
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

    getTableClassName = (isActive) => {
        const classNames = [
            styles.tableContainer,
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

    renderTable = (key, data) => {
        const { activeCluster } = this.state;
        const isActive = activeCluster && String(activeCluster.group) === String(data.id);
        const className = this.getTableClassName(isActive);

        const keywords = data.clusters.map(cluster => cluster.value).join(', ');
        const clusterIndex = Number(key) + 1;
        const leadsCount = data.documents.length;

        return (
            <div
                className={className}
                key={key}
            >
                <header className={styles.tableHeader}>
                    <h3>
                        {
                            _ts(
                                'clusterViz',
                                'tableHeader',
                                {
                                    clusterIndex,
                                    leadsCount,
                                },
                            )
                        }
                    </h3>
                </header>
                <div className={styles.keywords}>
                    <span className={styles.keywordLabel}>
                        {_ts('clusterViz', 'keywords')}
                    </span> : {keywords}
                </div>
                <Table
                    data={data.documents}
                    headers={this.documentHeader}
                    keyExtractor={ClusterViz.documentTableKeyExtractor}
                />
            </div>
        );
    }

    render() {
        const {
            clusterSize,
            createClusterPending,
            clusterDataPending,
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
                    { loading && <LoadingAnimation /> }
                    {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        data={this.nodesAndLinks}
                        idAccessor={ClusterViz.idAccessor}
                        groupAccessor={ClusterViz.groupAccessor}
                        valueAccessor={ClusterViz.valueAccessor}
                        useVoronoi
                        headerText={
                            _ts(
                                'clusterViz',
                                'clusterTitle',
                                { noOfClusters: this.noOfClusters, noOfLeads: this.noOfLeads },
                            )
                        }
                        onMouseOver={(d) => { this.setState({ activeCluster: d }); }}
                        onMouseOut={() => { this.setState({ activeCluster: undefined }); }}
                        clusterSize={clusterSize}
                        onClusterSizeChange={this.handleClusterSizeChange}
                    />
                    <ListView
                        className={styles.tables}
                        data={this.clusterGroupList}
                        keyExtractor={ClusterViz.getTableKey}
                        modifier={this.renderTable}
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
