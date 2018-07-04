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

import {
    hierarchicalData,
    chordData,
    barData,
    lineData,
    forceDirectedData,
    correlationData,
    sankeyData,
    parallelData,
    stackedData,
    streamData,
} from './dummyData';

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

@BoundError(AppError)
export default class Visualization extends React.PureComponent {
    render() {
        return (
            <div className={styles.visualization}>
                <header className={styles.header}>
                    <h2> {_ts('visualization', 'visualizationTitle')}</h2>
                </header>
                <div className={styles.container}>
                    <SunBurstView
                        className={styles.sunburst}
                        data={hierarchicalData}
                        valueAccessor={d => d.size}
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'sunburst')}
                    />
                    <CorrelationMatrixView
                        className={styles.correlationMatrix}
                        data={correlationData}
                        colorSchemeType="continuous"
                        headerText={_ts('visualization', 'correlationMatrix')}
                    />
                    <DendrogramView
                        className={styles.dendrogram}
                        data={hierarchicalData}
                        labelAccessor={d => d.name}
                        valueAccessor={d => d.size}
                        headerText={_ts('visualization', 'dendrogram')}
                    />
                    <RadialDendrogramView
                        className={styles.radialDendrogram}
                        data={hierarchicalData}
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'radialDendrogram')}
                    />
                    <TreeMapView
                        className={styles.treemap}
                        data={hierarchicalData}
                        valueAccessor={d => d.size}
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'treemap')}
                    />
                    <TreeMapView
                        className={styles.treemap}
                        data={hierarchicalData}
                        valueAccessor={d => d.size}
                        zoomable={false}
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'zoomableTreemap')}
                    />
                    <ChordDiagramView
                        className={styles.chordDiagram}
                        data={chordData.values}
                        labelsData={chordData.labels}
                        valueAccessor={d => d.size}
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'chordDiagram')}
                    />
                    <HorizontalBarView
                        className={styles.horizontalBar}
                        data={barData.data}
                        valueAccessor={d => d.value}
                        labelAccessor={d => d.label}
                        headerText={_ts('visualization', 'horizontalBar')}
                    />
                    <ForceDirectedGraphView
                        className={styles.forceDirectedGraph}
                        data={forceDirectedData}
                        idAccessor={d => d.id}
                        groupAccessor={d => d.group}
                        valueAccessor={d => d.value}
                        headerText={_ts('visualization', 'forcedDirectedGraph')}
                    />
                    <ForceDirectedGraphView
                        className={styles.forceDirectedGraphVoronoi}
                        data={forceDirectedData}
                        idAccessor={d => d.id}
                        groupAccessor={d => d.group}
                        valueAccessor={d => d.value}
                        useVoronoi={false}
                        headerText={_ts('visualization', 'forceDirectedGraphVoronoi')}
                    />
                    <CollapsibleTreeView
                        className={styles.collapsibleTreeView}
                        data={hierarchicalData}
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'collapsibleTree')}
                    />
                    <OrgChartView
                        className={styles.orgChart}
                        data={hierarchicalData}
                        idAccessor={d => d.name}
                        headerText={_ts('visualization', 'orgChart')}
                    />
                    <PieChartView
                        className={styles.pieChart}
                        data={barData.data}
                        valueAccessor={d => d.value}
                        labelAccessor={d => d.label}
                        headerText={_ts('visualization', 'pieChart')}
                    />
                    <DonutChartView
                        className={styles.donutChart}
                        data={barData.data}
                        valueAccessor={d => d.value}
                        labelAccessor={d => d.label}
                        headerText={_ts('visualization', 'donutChart')}
                    />
                    <OrganigramView
                        className={styles.organigram}
                        data={hierarchicalData}
                        idAccessor={d => d.name}
                        headerText={_ts('visualization', 'organigram')}
                    />
                    <StackedBarChartView
                        className={styles.stackedBarChart}
                        data={stackedData}
                        labelName="month"
                        labelAccessor={d => d.month}
                        headerText={_ts('visualization', 'stackedBarChart')}
                    />
                    <StreamGraphView
                        className={styles.streamGraph}
                        data={streamData}
                        labelName="time"
                        labelAccessor={d => d.time}
                        headerText={_ts('visualization', 'streamGraph')}
                    />
                    <SankeyView
                        className={styles.sankey}
                        data={sankeyData}
                        valueAccessor={d => d.value}
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'sankey')}
                    />
                    <SparkLinesView
                        className={styles.sparklines}
                        data={lineData.data}
                        valueAccessor={d => d.value}
                        headerText={_ts('visualization', 'sparklines')}
                    />
                    <ParallelCoordinatesView
                        className={styles.parallelCoordinates}
                        data={parallelData}
                        labelName="name"
                        labelAccessor={d => d.name}
                        headerText={_ts('visualization', 'parallelCoordinates')}
                    />
                </div>
            </div>
        );
    }
}
