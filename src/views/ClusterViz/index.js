import React, {
    PureComponent,
    Fragment,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import Page from '#rscv/Page';
import Message from '#rscv/Message';
import BoundError from '#rscg/BoundError';
import Badge from '#components/viewer/Badge';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import Table from '#rscv/Table';
import FormattedDate from '#rscv/FormattedDate';
import ForceDirectedGraph from '#rscz/NewForceDirectedGraph';
import wrapViz from '#rscz/VizWrapper';

import {
    _cs,
    reverseRoute,
    mapToList,
    listToGroupList,
} from '@togglecorp/fujs';
import Cloak from '#components/general/Cloak';
import BackLink from '#components/general/BackLink';
import VizError from '#components/error/VizError';

import _ts from '#ts';

import {
    forceDirectedDataSelector,
    projectClusterDataSelector,
    projectIdFromRouteSelector,
    setProjectClusterDataAction,
} from '#redux';
import { pathNames } from '#constants';

import ProjectClusterDataRequest from './requests/ProjectClusterDataRequest';
import InitProjectClusterRequest from './requests/InitProjectClusterRequest';

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

const decorate = component => BoundError(VizError)(wrapViz(component));
const ForceDirectedGraphView = decorate(ForceDirectedGraph);

const noOfClusters = 5;

@connect(mapStateToProps, mapDispatchToProps)
export default class ClusterViz extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getMaxNode = data => data.reduce((previous, current) => (
        current.score > previous.score ? current : previous
    ))

    static idSelector = d => d.id;
    static groupSelector = d => d.group;
    static valueSelector = d => d.value;
    static labelSelector = d => d.title;

    static getTableKey = data => data.id;
    static leadsTableKeyExtractor = row => row.id;

    static calculateNodesAndLinks = (projectClusterData) => {
        const keywords = projectClusterData.keywords || [];
        const documents = projectClusterData.documents || [];

        const keywordGroup = listToGroupList(keywords, d => d.cluster);

        const documentGroup = Object.keys(documents).map(key => (
            documents[key].map(doc => (
                { ...doc, group: key }
            ))
        ));
        const nodes = [].concat(...documentGroup);

        const max = Object.entries(documents)
            .map(([key, value]) => ({
                group: key,
                node: value[0] || {},
            }));

        const mappingFn = ([key, value]) => {
            const target = max.find(node => node.group === key) || {};
            const source = value.filter(node => (target.node || {}).id !== node.id);

            return source.map(node => ({
                source: node.id,
                target: target.node.id,
                value: 1,
            }));
        };

        // NOTE: Unflatten array using Array.concat(...arrayOfArray)
        const links = [].concat(...Object.entries(documentGroup).map(mappingFn));
        const clusterGroupList = mapToList(
            keywordGroup,
            (data, key) => (
                {
                    id: key,
                    clusters: data,
                    documents: documents[key] || [],
                }
            ),
        );

        return { nodesAndLinks: { links, nodes }, clusterGroupList };
    }

    constructor(props) {
        super(props);
        this.state = {
            clusterSize: 7,
            createClusterPending: true,
            clusterDataPending: true,
            highlightClusterId: undefined,
            highlightTableId: undefined,
            createClusterFailure: false,
            clusterDataFailure: false,
            entryToRedirectTo: undefined,
        };

        this.leadsTableHeader = [
            {
                key: 'title',
                label: _ts('clusterViz', 'leadsTableTitle'),
                order: 1,
            },
            {
                key: 'createdAt',
                label: _ts('clusterViz', 'leadsTableCreatedAt'),
                order: 2,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
        ];

        this.containerRef = React.createRef();
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.startRequestForInitCluster(activeProject);

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
            this.clearState();
            this.startRequestForInitCluster(newActiveProject);
        }
        if (newProjectClusterData !== oldProjectClusterData) {
            const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
                newProjectClusterData,
            );
            this.nodesAndLinks = nodesAndLinks;
            this.clusterGroupList = clusterGroupList;
            this.noOfLeads = clusterGroupList
                .map(cluster => cluster.documents.length)
                .reduce((sum, val) => sum + val, 0);
        }
    }

    componentDidUpdate() {
        const { current: container } = this.containerRef;
        if (!container) {
            return;
        }

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

    clearState = () => {
        this.setState({
            clusterSize: 7,
            createClusterPending: true,
            clusterDataPending: true,
            highlightClusterId: undefined,
            highlightTableId: undefined,
            createClusterFailure: false,
            clusterDataFailure: false,
        });
    }

    handleClusterSizeChange = (value) => {
        this.setState({ clusterSize: Number(value) });
    }

    startRequestForInitCluster = (activeProject) => {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
        const { stopRequestForClusterData, startRequestForClusterData } = this;

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

    stopRequestForInitCluster = () => {
        if (this.createClusterRequest) {
            this.createClusterRequest.stop();
        }
    }

    handleMouseOver = (d) => {
        this.setState({
            activeCluster: d,
            highlightTableId: d.id,
        });
    }

    handleMouseOut = () => {
        this.setState({
            activeCluster: undefined,
            highlightTableId: undefined,
        });
    }

    handleTableHover = (rowKey) => {
        this.setState({ highlightClusterId: rowKey });
    }

    handleTableHoverOut = () => {
        this.setState({
            highlightClusterId: undefined,
            highlightTableId: undefined,
        });
    }

    handleBodyClick = (rowKey) => {
        const entryToRedirectTo = reverseRoute(
            pathNames.editEntries,
            {
                projectId: this.props.activeProject,
                leadId: rowKey,
            },
        );
        this.setState({ entryToRedirectTo });
    }

    renderKeyword = (_, cluster) => {
        const {
            value: keyword,
        } = cluster;

        return (
            <Badge
                key={keyword}
                className={styles.keyword}
                title={keyword}
            />
        );
    }

    renderClusterDetail = (key, data) => {
        const {
            activeCluster,
            highlightTableId,
        } = this.state;

        const isActive = activeCluster && String(activeCluster.group) === String(data.id);

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

        const handleHover = (rowKey) => {
            const hoverLead = documents.find(d => d.id === rowKey) || {};
            const highlightClusterId = `${hoverLead.id}-${data.id}`;

            this.setState({
                highlightClusterId,
                highlightTableId: rowKey,
            });
        };

        return (
            <div
                className={_cs(
                    styles.clusterDetail,
                    isActive && styles.activeCluster,
                )}
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
                {documents.length > 0 && (
                    <div className={styles.leadList}>
                        <h5 className={styles.heading}>
                            {_ts('clusterViz', 'leadsTitle')}
                        </h5>
                        <Table
                            className={styles.leadsTable}
                            data={documents}
                            headers={this.leadsTableHeader}
                            onBodyHover={handleHover}
                            onBodyHoverOut={this.handleTableHoverOut}
                            onBodyClick={this.handleBodyClick}
                            highlightRowKey={highlightTableId}
                            keySelector={ClusterViz.leadsTableKeyExtractor}
                            emptyComponent={leadsEmptyComponent}
                        />
                    </div>
                )}
            </div>
        );
    }

    renderErrorMessage = () => {
        const {
            createClusterFailure,
            clusterDataFailure,
        } = this.state;

        return (
            <div className={styles.errorContainer} >
                {
                    createClusterFailure && (
                        <Fragment>
                            <div className={styles.message}>
                                <Message>
                                    {_ts('clusterViz', 'createClusterFailure', {
                                        addLeads: (
                                            <Link
                                                className={styles.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                to={reverseRoute(pathNames.addLeads, {
                                                    projectId: this.props.activeProject,
                                                })}
                                            >
                                                {_ts('clusterViz', 'addLeadsLinkLabel')}
                                            </Link>
                                        ),
                                    })}
                                </Message>
                            </div>
                        </Fragment>
                    )
                }
                {
                    clusterDataFailure && (
                        <Message>
                            {_ts('clusterViz', 'clusterDataFailure')}
                        </Message>
                    )
                }
            </div>
        );
    }

    render() {
        const {
            clusterSize,
            createClusterFailure,
            clusterDataFailure,
            createClusterPending,
            clusterDataPending,
            highlightClusterId,
            entryToRedirectTo,
        } = this.state;

        // FIXME: bug, shouldn't use cloak here and the condition is not complete
        if (entryToRedirectTo) {
            return (
                <Cloak
                    hide={({ hasAnalysisFramework }) => !hasAnalysisFramework}
                    render={
                        <Redirect
                            push
                            to={entryToRedirectTo}
                        />
                    }
                />
            );
        }

        const {
            className: classNameFromProps,
            activeProject,
        } = this.props;

        const graphHeaderText = _ts(
            'clusterViz',
            'clusterTitle',
            {
                noOfClusters: this.noOfClusters,
                noOfLeads: this.noOfLeads,
            },
        );

        const loading = createClusterPending || clusterDataPending;
        const failure = createClusterFailure || clusterDataFailure;
        const backLink = reverseRoute(pathNames.leads, { projectId: activeProject });
        const ErrorMessage = this.renderErrorMessage;

        return (
            <Page
                containerRef={this.containerRef}
                className={_cs(classNameFromProps, styles.clusterVisualization)}
                headerClassName={styles.header}
                header={
                    <React.Fragment>
                        <BackLink
                            className={styles.backLink}
                            defaultLink={backLink}
                        />
                        <h2 className={styles.heading}>
                            {_ts('clusterViz', 'clusterVizTitle')}
                        </h2>
                    </React.Fragment>
                }
                mainContentClassName={styles.mainContent}
                mainContent={
                    failure ? (
                        <ErrorMessage />
                    ) : (
                        <div className={styles.clusterContainer}>
                            { loading && <LoadingAnimation /> }
                            { /* eslint-disable-next-line max-len */ }
                            { /* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */ }
                            <ForceDirectedGraphView
                                className={styles.forcedDirectedGraph}
                                data={this.nodesAndLinks}
                                idSelector={ClusterViz.idSelector}
                                groupSelector={ClusterViz.groupSelector}
                                valueSelector={ClusterViz.valueSelector}
                                labelSelector={ClusterViz.labelSelector}
                                highlightClusterId={highlightClusterId}
                                useVoronoi
                                headerText={graphHeaderText}
                                onMouseOver={this.handleMouseOver}
                                onMouseOut={this.handleMouseOut}
                                clusterSize={clusterSize}
                                onClusterSizeChange={this.handleClusterSizeChange}
                                showBackButton
                            />
                            <ListView
                                className={styles.clusterDetails}
                                data={this.clusterGroupList}
                                keySelector={ClusterViz.getTableKey}
                                modifier={this.renderClusterDetail}
                            />
                        </div>
                    )
                }
            />
        );
    }
}
