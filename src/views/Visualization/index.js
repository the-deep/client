import React from 'react';
import _ts from '#ts';

import wrapViz from '#rs/components/Visualization/VizWrapper';
import SunBurst from '#rs/components/Visualization/SunBurst';
import ChordDiagram from '#rs/components/Visualization/ChordDiagram';
import TreeMap from '#rs/components/Visualization/TreeMap';
import CorrelationMatrix from '#rs/components/Visualization/CorrelationMatrix';
import OrgChart from '#rs/components/Visualization/OrgChart';
import HorizontalBar from '#rs/components/Visualization/HorizontalBar';
import Dendrogram from '#rs/components/Visualization/Dendrogram';
import ForceDirectedGraph from '#rs/components/Visualization/ForceDirectedGraph';
import CollapsibleTree from '#rs/components/Visualization/CollapsibleTree';
import RadialDendrogram from '#rs/components/Visualization/RadialDendrogram';
import PieChart from '#rs/components/Visualization/PieChart';
import DonutChart from '#rs/components/Visualization/DonutChart';
import Sankey from '#rs/components/Visualization/Sankey';
import ParallelCoordinates from '#rs/components/Visualization/ParallelCoordinates';
import StreamGraph from '#rs/components/Visualization/StreamGraph';
import StackedBarChart from '#rs/components/Visualization/StackedBarChart';
import SparkLines from '#rs/components/Visualization/SparkLines';
import Organigram from '#rs/components/Visualization/Organigram';

import BoundError from '#rs/components/General/BoundError';
import VizError from '#components/VizError';
import AppError from '#components/AppError';

import barData from './dummydata/barData';
import chordData from './dummydata/chordData';
import correlationData from './dummydata/correlationData';
import forceDirectedData from './dummydata/forceDirectedData';
import hierarchicalData from './dummydata/hierarchical';
import lineData from './dummydata/lineData';
import parallelData from './dummydata/parallelData';
import sankeyData from './dummydata/sankeyData';
import stackedData from './dummydata/stackedData';
import streamData from './dummydata/streamData';

import styles from './styles.scss';

const ChordDiagramView = BoundError(VizError)(wrapViz(ChordDiagram));
const SunBurstView = BoundError(VizError)(wrapViz(SunBurst));
const CorrelationMatrixView = BoundError(VizError)(wrapViz(CorrelationMatrix));
const RadialDendrogramView = BoundError(VizError)(wrapViz(RadialDendrogram));
const TreeMapView = BoundError(VizError)(wrapViz(TreeMap));
const ForceDirectedGraphView = BoundError(VizError)(wrapViz(ForceDirectedGraph));
const CollapsibleTreeView = BoundError(VizError)(wrapViz(CollapsibleTree));
const OrgChartView = BoundError(VizError)(wrapViz(OrgChart));
const HorizontalBarView = BoundError(VizError)(wrapViz(HorizontalBar));
const DendrogramView = BoundError(VizError)(wrapViz(Dendrogram));
const SparkLinesView = BoundError(VizError)(wrapViz(SparkLines));
const StackedBarChartView = BoundError(VizError)(wrapViz(StackedBarChart));
const StreamGraphView = BoundError(VizError)(wrapViz(StreamGraph));
const SankeyView = BoundError(VizError)(wrapViz(Sankey));
const PieChartView = BoundError(VizError)(wrapViz(PieChart));
const DonutChartView = BoundError(VizError)(wrapViz(DonutChart));
const OrganigramView = BoundError(VizError)(wrapViz(Organigram));
const ParallelCoordinatesView = BoundError(VizError)(wrapViz(ParallelCoordinates));

const sizeAccessor = d => d.size;
const nameAccessor = d => d.name;
const valueAccessor = d => d.value;
const labelAccessor = d => d.label;
const idAccessor = d => d.id;
const groupAccessor = d => d.group;
const monthAccessor = d => d.month;
const timeAccessor = d => d.time;

@BoundError(AppError)
export default class Visualization extends React.PureComponent {
    render() {
        return (
            <div className={styles.visualization}>
                <header className={styles.header}>
                    <h2>
                        {_ts('visualization', 'visualizationTitle')}
                    </h2>
                </header>
                <div className={styles.container}>
                    <SunBurstView
                        className={styles.sunburst}
                        headerText={_ts('visualization', 'sunburst')}
                        data={hierarchicalData}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                    />
                    <CorrelationMatrixView
                        className={styles.correlationMatrix}
                        headerText={_ts('visualization', 'correlationMatrix')}
                        data={correlationData}
                        colorSchemeType="continuous"
                    />
                    <DendrogramView
                        className={styles.dendrogram}
                        headerText={_ts('visualization', 'dendrogram')}
                        data={hierarchicalData}
                        labelAccessor={nameAccessor}
                        valueAccessor={sizeAccessor}
                    />
                    <RadialDendrogramView
                        className={styles.radialDendrogram}
                        headerText={_ts('visualization', 'radialDendrogram')}
                        data={hierarchicalData}
                        labelAccessor={nameAccessor}
                    />
                    <TreeMapView
                        className={styles.treemap}
                        headerText={_ts('visualization', 'treemap')}
                        data={hierarchicalData}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                    />
                    <TreeMapView
                        className={styles.treemap}
                        headerText={_ts('visualization', 'zoomableTreemap')}
                        data={hierarchicalData}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                        zoomable={false}
                    />
                    <ChordDiagramView
                        className={styles.chordDiagram}
                        headerText={_ts('visualization', 'chordDiagram')}
                        data={chordData.values}
                        labelsData={chordData.labels}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                    />
                    <HorizontalBarView
                        className={styles.horizontalBar}
                        headerText={_ts('visualization', 'horizontalBar')}
                        data={barData.data}
                        valueAccessor={valueAccessor}
                        labelAccessor={labelAccessor}
                    />
                    <ForceDirectedGraphView
                        className={styles.forceDirectedGraph}
                        headerText={_ts('visualization', 'forcedDirectedGraph')}
                        data={forceDirectedData}
                        idAccessor={idAccessor}
                        groupAccessor={groupAccessor}
                        valueAccessor={valueAccessor}
                    />
                    <ForceDirectedGraphView
                        className={styles.forceDirectedGraphVoronoi}
                        headerText={_ts('visualization', 'forceDirectedGraphVoronoi')}
                        data={forceDirectedData}
                        idAccessor={idAccessor}
                        groupAccessor={groupAccessor}
                        valueAccessor={valueAccessor}
                        useVoronoi={false}
                    />
                    <CollapsibleTreeView
                        className={styles.collapsibleTreeView}
                        headerText={_ts('visualization', 'collapsibleTree')}
                        data={hierarchicalData}
                        labelAccessor={nameAccessor}
                    />
                    <OrgChartView
                        className={styles.orgChart}
                        headerText={_ts('visualization', 'orgChart')}
                        data={hierarchicalData}
                        idAccessor={nameAccessor}
                    />
                    <PieChartView
                        className={styles.pieChart}
                        headerText={_ts('visualization', 'pieChart')}
                        data={barData.data}
                        valueAccessor={valueAccessor}
                        labelAccessor={labelAccessor}
                    />
                    <DonutChartView
                        className={styles.donutChart}
                        headerText={_ts('visualization', 'donutChart')}
                        data={barData.data}
                        valueAccessor={valueAccessor}
                        labelAccessor={labelAccessor}
                    />
                    <OrganigramView
                        className={styles.organigram}
                        headerText={_ts('visualization', 'organigram')}
                        data={hierarchicalData}
                        idAccessor={nameAccessor}
                    />
                    <StackedBarChartView
                        className={styles.stackedBarChart}
                        headerText={_ts('visualization', 'stackedBarChart')}
                        data={stackedData}
                        labelName="month"
                        labelAccessor={monthAccessor}
                    />
                    <StreamGraphView
                        className={styles.streamGraph}
                        headerText={_ts('visualization', 'streamGraph')}
                        data={streamData}
                        labelName="time"
                        labelAccessor={timeAccessor}
                    />
                    <SankeyView
                        className={styles.sankey}
                        headerText={_ts('visualization', 'sankey')}
                        data={sankeyData}
                        valueAccessor={valueAccessor}
                        labelAccessor={nameAccessor}
                    />
                    <SparkLinesView
                        className={styles.sparklines}
                        headerText={_ts('visualization', 'sparklines')}
                        data={lineData.data}
                        valueAccessor={valueAccessor}
                    />
                    <ParallelCoordinatesView
                        className={styles.parallelCoordinates}
                        headerText={_ts('visualization', 'parallelCoordinates')}
                        data={parallelData}
                        labelName="name"
                        labelAccessor={nameAccessor}
                    />
                </div>
            </div>
        );
    }
}
