import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BoundError from '#rs/components/General/BoundError';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Table from '#rs/components/View/Table';
import List from '#rs/components/View/List';
import ForceDirectedGraph from '#rs/components/Visualization/ForceDirectedGraph';
import wrapViz from '#rs/components/Visualization/VizWrapper';

import {
    reverseRoute,
    mapToList,
    groupList,
    compareString,
    compareNumber,
    compareDate,
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
            id: cluster.value,
            group: cluster.cluster,
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
                source: node.value,
                target: target.node.value,
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
            createClusterPending: true,
            clusterDataPending: true,
        };
        this.keywordHeader = [
            {
                key: 'value',
                label: _ts('clusterViz', 'keywordTableValueLabel'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.value, b.value),
            },
            {
                key: 'score',
                label: _ts('clusterViz', 'keywordTableScoreLabel'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareNumber(a.score, b.score),
            },
        ];

        this.documentHeader = [
            {
                key: 'title',
                label: _ts('clusterViz', 'documentTableTitleLabel'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.value, b.value),
            },
            {
                key: 'classifiedDocId',
                label: _ts('clusterViz', 'documentTableClassifiedDocIdLabel'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareNumber(a.classifiedDocId, b.classifiedDocId),
            },
            {
                key: 'createdAt',
                label: _ts('clusterViz', 'documentTableCreatedAtLabel'),
                order: 3,
                sortable: true,
                comaparator: (a, b) => compareDate(a.createdAt, b.createdAt),
            },
        ];
    }

    componentWillMount() {
        this.startRequestForInitCluster();

        const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
            this.props.projectClusterData,
        );
        this.nodesAndLinks = nodesAndLinks;
        this.clusterGroupList = clusterGroupList;
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

    componentWillUnmount() {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
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

    renderTable = (key, value) => (
        <div
            key={key}
        >
            <header className={styles.tableHeader}>
                <h3>cluster-{key}</h3>
            </header>
            <Table
                key={`document--${key}`}
                data={value.documents}
                headers={this.documentHeader}
                keyExtractor={ClusterViz.documentTableKeyExtractor}
            />
            <Table
                key={`keywords-${key}`}
                data={value.clusters}
                headers={this.keywordHeader}
                keyExtractor={ClusterViz.keywordTableKeyExtractor}
            />
        </div>
    )

    render() {
        const {
            createClusterPending,
            clusterDataPending,
        } = this.state;

        const {
            className,
            activeProject,
        } = this.props;

        return (
            <div className={`${styles.cluster} ${className}`}>
                <header className={styles.header}>
                    <h2> {_ts('clusterViz', 'clusterVizTitle')} </h2>
                </header>
                <div className={styles.container}>
                    {
                        (createClusterPending || clusterDataPending) &&
                        <LoadingAnimation />
                    }
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        data={this.nodesAndLinks}
                        idAccessor={ClusterViz.idAccessor}
                        useVoronoi
                        groupAccessor={ClusterViz.groupAccessor}
                        valueAccessor={ClusterViz.valueAccessor}
                        headerText="Clusters"
                    />
                    <div className={styles.tableContainer}>
                        <List
                            data={this.clusterGroupList}
                            keyExtractor={ClusterViz.getTableKey}
                            modifier={this.renderTable}
                        />
                    </div>
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
