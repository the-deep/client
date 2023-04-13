import React from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

import ProgressLine from '#components/ProgressLine';

import styles from './styles.css';

interface Props {
    sourcesUsed: number;
    totalSources: number;
    entriesUsed: number;
    totalEntries: number;
    diversityChartData: {
        id: string;
        title: string;
        count: number;
    }[];
}
function Stats(props: Props) {
    const {
        sourcesUsed,
        totalSources,
        entriesUsed,
        totalEntries,
        diversityChartData,
    } = props;

    return (
        <div className={styles.stats}>
            <div className={styles.container}>
                <div className={styles.heading}>Sources</div>
                <ProgressLine
                    titleClassName={styles.title}
                    progress={(sourcesUsed / totalSources) * 100}
                    title={`${sourcesUsed} out of ${totalSources} sources used in report text`}
                    variant="complement1"
                    hideInfoCircleBackground
                    hideInfoCircle
                />
            </div>
            <div className={styles.container}>
                <div className={styles.heading}>Entries</div>
                <ProgressLine
                    titleClassName={styles.title}
                    progress={(entriesUsed / totalEntries) * 100}
                    title={`${entriesUsed} out of ${totalEntries} entries used in report text`}
                    variant="complement2"
                    hideInfoCircleBackground
                    hideInfoCircle
                />
            </div>
            <div className={styles.chartContainer}>
                <div className={styles.heading}>Diversity</div>
                <ResponsiveContainer className={styles.chart}>
                    <RadarChart cx="50%" cy="50%" outerRadius="100%" data={diversityChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="title" tick={false} />
                        <Radar name="Count" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip
                            isAnimationActive={false}
                            offset={20}
                            allowEscapeViewBox={{ x: false, y: true }}
                            wrapperStyle={{ zIndex: 1000 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Stats;
