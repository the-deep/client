import React, { Fragment } from 'react';
import _ts from '#ts';

import Page from '#rscv/Page';
import VerticalTabs from '#rscv/VerticalTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import wrapViz from '#rscz/VizWrapper';
import SunBurst from '#rscz/SunBurst';
import ChordDiagram from '#rscz/ChordDiagram';
import TreeMap from '#rscz/TreeMap';
import ZoomableTreeMap from '#rscz/ZoomableTreeMap';
import CorrelationMatrix from '#rscz/CorrelationMatrix';
import OrgChart from '#rscz/OrgChart';
import HorizontalBar from '#rscz/HorizontalBar';
import Dendrogram from '#rscz/Dendrogram';
import ForceDirectedGraph from '#rscz/ForceDirectedGraph';
import ClusterForceLayout from '#rscz/ClusterForceLayout';
import CollapsibleTree from '#rscz/CollapsibleTree';
import RadialDendrogram from '#rscz/RadialDendrogram';
import PieChart from '#rscz/PieChart';
import DonutChart from '#rscz/DonutChart';
import Sankey from '#rscz/Sankey';
import ParallelCoordinates from '#rscz/ParallelCoordinates';
import StreamGraph from '#rscz/StreamGraph';
import StackedBarChart from '#rscz/StackedBarChart';
import SparkLines from '#rscz/SparkLines';
import Organigram from '#rscz/Organigram';
import GoogleOrgChart from '#rscz/GoogleOrgChart';

import BoundError from '#rscg/BoundError';
import VizError from '#components/error/VizError';

import barData from './dummydata/barData';
import chordData from './dummydata/chordData';
import clusterData from './dummydata/clusterData';
import correlationData from './dummydata/correlationData';
import forceDirectedData from './dummydata/forceDirectedData';
import hierarchicalData from './dummydata/hierarchical';
import lineData from './dummydata/lineData';
import parallelData from './dummydata/parallelData';
import sankeyData from './dummydata/sankeyData';
import stackedData from './dummydata/stackedData';
import streamData from './dummydata/streamData';
import orgChartData from './dummydata/orgChartData';

import styles from './styles.scss';

const decorate = component => BoundError(VizError)(wrapViz(component));

const ChordDiagramView = decorate(ChordDiagram);
const SunBurstView = decorate(SunBurst);
const CorrelationMatrixView = decorate(CorrelationMatrix);
const RadialDendrogramView = decorate(RadialDendrogram);
const TreeMapView = decorate(TreeMap);
const ZoomableTreeMapView = decorate(ZoomableTreeMap);
const ForceDirectedGraphView = decorate(ForceDirectedGraph);
const ClusterForceLayoutView = decorate(ClusterForceLayout);
const CollapsibleTreeView = decorate(CollapsibleTree);
const OrgChartView = decorate(OrgChart);
const HorizontalBarView = decorate(HorizontalBar);
const DendrogramView = decorate(Dendrogram);
const SparkLinesView = decorate(SparkLines);
const StackedBarChartView = decorate(StackedBarChart);
const StreamGraphView = decorate(StreamGraph);
const SankeyView = decorate(Sankey);
const PieChartView = decorate(PieChart);
const DonutChartView = decorate(DonutChart);
const OrganigramView = decorate(Organigram);
const GoogleOrgChartView = decorate(GoogleOrgChart);
const ParallelCoordinatesView = decorate(ParallelCoordinates);
const sizeSelector = d => d.size;
const nameSelector = d => d.name;
const valueSelector = d => d.value;
const labelSelector = d => d.label;
const idSelector = d => d.id;
const groupSelector = d => d.group;
const monthSelector = d => d.month;
const timeSelector = d => d.time;
const orgChartkeySelector = d => d.key;
const orgChartChildSelector = d => d.organs;
const orgChartTitleSelector = d => d.title;
const clusterIdSelector = d => d.id;
const clusterGroupSelector = d => d.cluster;
const clusterValueSelector = d => d.value;

export default class Visualization extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = ({
            value: [],
        });

        this.tabs = {
            chordDiagram: _ts('visualization', 'chordDiagram'),
            collapsibleTree: _ts('visualization', 'collapsibleTree'),
            correlationMatrix: _ts('visualization', 'correlationMatrix'),
            dendrogram: _ts('visualization', 'dendrogram'),
            donutChart: _ts('visualization', 'donutChart'),
            forcedDirectedGraph: _ts('visualization', 'forcedDirectedGraph'),
            forcedDirectedGraphVoronoi: _ts('visualization', 'forceDirectedGraphVoronoi'),
            googleOrgChart: _ts('visualization', 'googleOrgChart'),
            clusterForceLayout: _ts('visualization', 'clusterForceLayout'),
            horizontalBar: _ts('visualization', 'horizontalBar'),
            orgChart: _ts('visualization', 'orgChart'),
            organigram: _ts('visualization', 'organigram'),
            parallelCoordinates: _ts('visualization', 'parallelCoordinates'),
            pieChart: _ts('visualization', 'pieChart'),
            radialDendrogram: _ts('visualization', 'radialDendrogram'),
            sankey: _ts('visualization', 'sankey'),
            sparkLines: _ts('visualization', 'sparklines'),
            stackedBarChart: _ts('visualization', 'stackedBarChart'),
            streamGraph: _ts('visualization', 'streamGraph'),
            sunBurst: _ts('visualization', 'sunburst'),
            treemap: _ts('visualization', 'treemap'),
            zoomableTreemap: _ts('visualization', 'zoomableTreemap'),
        };

        this.views = {
            chordDiagram: {
                component: () => (
                    <ChordDiagramView
                        className={styles.chordDiagram}
                        headerText={_ts('visualization', 'chordDiagram')}
                        data={chordData.values}
                        labelsData={chordData.labels}
                        valueSelector={sizeSelector}
                        labelSelector={nameSelector}
                    />
                ),
            },
            collapsibleTree: {
                component: () => (
                    <CollapsibleTreeView
                        className={styles.collapsibleTreeView}
                        headerText={_ts('visualization', 'collapsibleTree')}
                        data={hierarchicalData}
                        labelSelector={nameSelector}
                    />
                ),
            },
            correlationMatrix: {
                component: () => (
                    <CorrelationMatrixView
                        className={styles.correlationMatrix}
                        headerText={_ts('visualization', 'correlationMatrix')}
                        data={correlationData}
                        colorSchemeType="continuous"
                    />
                ),
            },
            dendrogram: {
                component: () => (
                    <DendrogramView
                        className={styles.dendrogram}
                        headerText={_ts('visualization', 'dendrogram')}
                        data={hierarchicalData}
                        labelSelector={nameSelector}
                        valueSelector={sizeSelector}
                    />
                ),
            },
            donutChart: {
                component: () => (
                    <DonutChartView
                        className={styles.donutChart}
                        headerText={_ts('visualization', 'donutChart')}
                        data={barData.data}
                        valueSelector={valueSelector}
                        labelSelector={labelSelector}
                    />
                ),
            },
            forcedDirectedGraph: {
                component: () => (
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        headerText={_ts('visualization', 'forcedDirectedGraph')}
                        data={forceDirectedData}
                        idSelector={idSelector}
                        groupSelector={groupSelector}
                        valueSelector={valueSelector}
                        useVoronoi={false}
                    />
                ),
            },
            forcedDirectedGraphVoronoi: {
                component: () => (
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraphVoronoi}
                        headerText={_ts('visualization', 'forceDirectedGraphVoronoi')}
                        data={forceDirectedData}
                        idSelector={idSelector}
                        groupSelector={groupSelector}
                        valueSelector={valueSelector}
                    />
                ),
            },
            clusterForceLayout: {
                component: () => (
                    <ClusterForceLayoutView
                        className={styles.clusterForceLayout}
                        headerText={_ts('visualization', 'clusterForceLayout')}
                        data={clusterData}
                        idSelector={clusterIdSelector}
                        groupSelector={clusterGroupSelector}
                        valueSelector={clusterValueSelector}
                    />
                ),
            },
            horizontalBar: {
                component: () => (
                    <HorizontalBarView
                        className={styles.horizontalBar}
                        headerText={_ts('visualization', 'horizontalBar')}
                        data={barData.data}
                        valueSelector={valueSelector}
                        labelSelector={labelSelector}
                    />
                ),
            },
            organigram: {
                component: () => (
                    <OrganigramView
                        className={styles.organigram}
                        headerText={_ts('visualization', 'organigram')}
                        data={hierarchicalData}
                        idSelector={nameSelector}
                    />
                ),
            },
            googleOrgChart: {
                component: () => (
                    <GoogleOrgChartView
                        className={styles.googleOrgChart}
                        headerText={_ts('visualization', 'googleOrgChart')}
                        options={orgChartData}
                        value={this.state.value}
                        onChange={this.onChange}
                        singleSelect
                        disabled
                        keySelector={orgChartkeySelector}
                        childSelector={orgChartChildSelector}
                        titleSelector={orgChartTitleSelector}
                    />
                ),
            },
            orgChart: {
                component: () => (
                    <OrgChartView
                        className={styles.orgChart}
                        headerText={_ts('visualization', 'orgChart')}
                        data={hierarchicalData}
                        idSelector={nameSelector}
                    />
                ),
            },
            parallelCoordinates: {
                component: () => (
                    <ParallelCoordinatesView
                        className={styles.parallelCoordinates}
                        headerText={_ts('visualization', 'parallelCoordinates')}
                        data={parallelData}
                        labelName="name"
                        labelSelector={nameSelector}
                    />
                ),
            },
            pieChart: {
                component: () => (
                    <PieChartView
                        className={styles.pieChart}
                        headerText={_ts('visualization', 'pieChart')}
                        data={barData.data}
                        valueSelector={valueSelector}
                        labelSelector={labelSelector}
                    />
                ),
            },
            radialDendrogram: {
                component: () => (
                    <RadialDendrogramView
                        className={styles.radialDendrogram}
                        headerText={_ts('visualization', 'radialDendrogram')}
                        data={hierarchicalData}
                        labelSelector={nameSelector}
                    />
                ),
            },
            sankey: {
                component: () => (
                    <SankeyView
                        className={styles.sankey}
                        headerText={_ts('visualization', 'sankey')}
                        data={sankeyData}
                        valueSelector={valueSelector}
                        labelSelector={nameSelector}
                    />
                ),
            },
            sparkLines: {
                component: () => (
                    <SparkLinesView
                        className={styles.sparklines}
                        headerText={_ts('visualization', 'sparklines')}
                        data={lineData.data}
                        xValueSelector={d => d.label}
                        yValueSelector={d => d.value}
                    />
                ),
            },
            stackedBarChart: {
                component: () => (
                    <StackedBarChartView
                        className={styles.stackedBarChart}
                        headerText={_ts('visualization', 'stackedBarChart')}
                        data={stackedData}
                        labelName="month"
                        labelSelector={monthSelector}
                    />
                ),
            },
            streamGraph: {
                component: () => (
                    <StreamGraphView
                        className={styles.streamGraph}
                        headerText={_ts('visualization', 'streamGraph')}
                        data={streamData}
                        labelName="time"
                        labelSelector={timeSelector}
                    />
                ),
            },
            sunBurst: {
                component: () => (
                    <SunBurstView
                        className={styles.sunburst}
                        headerText={_ts('visualization', 'sunburst')}
                        data={hierarchicalData}
                        valueSelector={sizeSelector}
                        labelSelector={nameSelector}
                    />
                ),
            },
            treemap: {
                component: () => (
                    <TreeMapView
                        className={styles.treemap}
                        headerText={_ts('visualization', 'treemap')}
                        data={hierarchicalData}
                        valueSelector={sizeSelector}
                        labelSelector={nameSelector}
                    />
                ),
            },
            zoomableTreemap: {
                component: () => (
                    <ZoomableTreeMapView
                        className={styles.treemap}
                        headerText={_ts('visualization', 'zoomableTreemap')}
                        data={hierarchicalData}
                        valueSelector={sizeSelector}
                        labelSelector={nameSelector}
                    />
                ),
            },
        };
    }

    onChange = (d) => {
        this.setState({ value: d });
    }

    render() {
        return (
            <Page
                className={styles.visualization}
                headerClassName={styles.header}
                header={
                    <h2>
                        {_ts('visualization', 'visualizationTitle')}
                    </h2>
                }
                mainContentClassName={styles.content}
                mainContent={
                    <Fragment>
                        <VerticalTabs
                            tabs={this.tabs}
                            className={styles.tabs}
                            useHash
                        />
                        <MultiViewContainer
                            className={styles.visualizations}
                            views={this.views}
                            useHash
                        />
                    </Fragment>
                }
            />
        );
    }
}
