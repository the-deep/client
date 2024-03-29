import React from 'react';
import { _cs } from '@togglecorp/fujs';
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
    className?: string;
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
        className,
        sourcesUsed,
        totalSources,
        entriesUsed,
        totalEntries,
        diversityChartData,
    } = props;

    return (
        <div className={_cs(className, styles.stats)}>
            <div className={styles.container}>
                <div className={styles.heading}>Sources</div>
                <ProgressLine
                    titleClassName={styles.title}
                    progress={(sourcesUsed / totalSources) * 100}
                    title={`${sourcesUsed} out of ${totalSources} sources used`}
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
                    title={`${entriesUsed} out of ${totalEntries} entries used`}
                    variant="complement2"
                    hideInfoCircleBackground
                    hideInfoCircle
                />
            </div>
            <div className={styles.chartContainer}>
                <div className={styles.heading}>Source Diversity</div>
                <ResponsiveContainer className={styles.chart}>
                    <RadarChart cx="50%" cy="50%" outerRadius="100%" data={diversityChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="title" tick={false} />
                        <Radar
                            name="Count"
                            dataKey="count"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                        />
                        <Tooltip
                            isAnimationActive={false}
                            offset={20}
                            wrapperStyle={{ zIndex: 100000000 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Stats;
