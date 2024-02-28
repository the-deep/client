import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import {
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import {
    KPIs,
    Timeline,
} from '@the-deep/reporting-module-components';
import ReactMarkdown from 'react-markdown';

import {
    AnalysisReportContainerContentTypeEnum,
} from '#generated/types';

import {
    type ContentDataType,
    type ConfigType,
    type ContentConfigType,
} from '../../../schema';
import {
    resolveTextStyle,
    resolveKpiTextStyle,
    type ContentDataFileMap,
} from '../../../utils';

import styles from './styles.css';

export interface TimelineData {
    date: string;
    category: string;
    title: string;
    details: string;
    source: string;
    link: string;
}

const dummy: TimelineData[] = [
    {
        date: '2023-08-16',
        category: 'Security',
        title: 'Ukraine Retakes Southeast Village of Urozhaine',
        details: 'The move signals Ukraine is proceeding with its southern offensive toward the Sea of Azov; Ukraine has struggled to make progress due to extensive Russian minefields and defensive lines',
        source: 'Reuters',
        link: 'https://www.reuters.com/world/europe/ukraine-says-recaptures-urozhaine-donetsk-region-russian-forces-2023-08-16//',
    },
    {
        date: '2023-08-04',
        category: 'Politics',
        title: 'Saudi Arabia Hosts Talks on Path to Peace in Ukraine',
        details: 'Officials from some forty countries, including the United States and Ukraine, will meet in Jeddah to discuss a peace blueprint for ending the war in Ukraine; envoys from India, Brazil, and South Africa will attend, while Russia will not',
        source: 'Reuters',
        link: 'https://www.reuters.com/world/europe/ukraine-seeks-global-support-peace-blueprint-saudi-talks-2023-08-03/',
    },
    {
        date: '2023-08-02',
        category: 'Security',
        title: 'Russia Strikes Ukrainian Port',
        details: 'The port is situated across the Danube River that has served as Kyiv’s main channel for exporting grains since Moscow pulled out of the Black Sea grain deal last month; the attacks have sent grain prices higher as Russia escalates its attempt to prevent Ukraine from exporting grain. overall, Russian strikes have destroyed 180,000 tons of grain since they withdrew from the deal last month, sending global grain prices soaring',
        source: 'Reuters',
        link: 'https://link.cfr.org/click/32270698.41059/aHR0cHM6Ly93d3cucmV1dGVycy5jb20vd29ybGQvZXVyb3BlL3J1c3NpYS1oaXRzLXBvcnQtZ3JhaW4tc2lsby11a3JhaW5lcy1vZGVzYS1yZWdpb24tb2ZmaWNpYWwtMjAyMy0wOC0wMi8_dXRtX3NvdXJjZT1kYWlseWJyaWVm/62ebdaab3aab00bdd8097cdeB208055ef?_gl=1*c02wgk*_ga*ODI1NzMzMDk0LjE2OTMxNDAwMTI.&_ga=2.205057296.1487289274.1693140012-825733094.1693140012',
    },
    {
        date: '2023-07-27',
        category: 'Security',
        title: 'Ukraine Sends New Troops into Battle in Country’s South',
        details: 'The move constitutes a new push in Ukraine’s ongoing counteroffensive against Russian forces; heavy fighting was reported around the village of Robotyne in southern Ukraine',
        source: 'Economist',
        link: 'https://www.economist.com/international/2023/07/27/the-ukrainian-army-commits-new-forces-in-a-big-southward-push',
    },
    {
        date: '2023-07-25',
        category: 'Security',
        title: 'Russia Strikes Ukrainian Alternative Grain Export Route',
        details: 'Following Moscow’s dissolution of the Black Sea Grain Initiative, Russian drones yesterday attacked Ukrainian grain warehouses and other facilities on the Danube River, an alternative route for Ukraine to export grain without using the Black Sea ports currently blocked by Russia',
        source: 'Guardian',
        link: 'https://www.theguardian.com/world/2023/jul/24/russian-drones-destroy-grain-warehouses-ukraine-danube-ports',
    },
    {
        date: '2023-07-23',
        category: 'Security',
        title: 'Russia Strikes Odesa Port Infrastructure and city for the fifth consecutive day',
        details: 'Russia said it struck a fuel storage facility and a weapons plant in the port city of Odesa in Ukraine today in retaliation for yesterday’s attack by Ukrainian forces on a bridge leading to Russia-occupied Crimea',
        source: 'Guardian',
        link: 'https://www.theguardian.com/world/2023/jul/24/russian-drones-destroy-grain-warehouses-ukraine-danube-ports',
    },
];

interface Props {
    contentType: AnalysisReportContainerContentTypeEnum;
    contentData: ContentDataType[] | undefined;
    configuration: ContentConfigType | undefined;
    generalConfiguration: ConfigType | undefined;
    contentDataToFileMap: ContentDataFileMap | undefined;
}

function Content(props: Props) {
    const {
        contentType,
        configuration: configurationFromProps,
        generalConfiguration,
        contentData,
        contentDataToFileMap,
    } = props;

    const configuration = removeNull(configurationFromProps);

    if (contentType === 'HEADING') {
        const content = configuration?.heading?.content;
        const variant = configuration?.heading?.variant;
        const style = configuration?.heading?.style;

        if (variant === 'H4') {
            return (
                <h4
                    className={_cs(
                        styles.heading,
                        styles.headingFour,
                    )}
                    style={resolveTextStyle(
                        style?.content,
                        generalConfiguration?.headingContentStyle?.h4,
                    )}
                >
                    {content || 'Title goes here'}
                </h4>
            );
        }
        if (variant === 'H3') {
            return (
                <h3
                    className={_cs(
                        styles.heading,
                        styles.headingThree,
                    )}
                    style={resolveTextStyle(
                        style?.content,
                        generalConfiguration?.headingContentStyle?.h3,
                    )}
                >
                    {content || 'Title goes here'}
                </h3>
            );
        }
        if (variant === 'H2') {
            return (
                <h2
                    className={_cs(
                        styles.heading,
                        styles.headingTwo,
                    )}
                    style={resolveTextStyle(
                        style?.content,
                        generalConfiguration?.headingContentStyle?.h2,
                    )}
                >
                    {content || 'Title goes here'}
                </h2>
            );
        }
        return (
            <h1
                className={_cs(
                    styles.heading,
                    styles.headingOne,
                )}
                style={resolveTextStyle(
                    style?.content,
                    generalConfiguration?.headingContentStyle?.h1,
                )}
            >
                {content || 'Title goes here'}
            </h1>
        );
    }

    if (contentType === 'TEXT') {
        const content = configuration?.text?.content;
        const style = configuration?.text?.style;

        return (
            <div
                style={resolveTextStyle(
                    style?.content,
                    generalConfiguration?.textContentStyle?.content,
                )}
            >
                <ReactMarkdown className={styles.markdown}>
                    {content || 'Content goes here'}
                </ReactMarkdown>
            </div>
        );
    }

    if (contentType === 'KPI') {
        const kpis = configuration?.kpi?.items;
        const sourceStyle = configuration?.kpi?.sourceContentStyle?.content ?? {};
        const subtitleStyle = configuration?.kpi?.subtitleContentStyle?.content ?? {};
        const titleStyle = configuration?.kpi?.titleContentStyle?.content ?? {};
        const valueStyle = configuration?.kpi?.valueContentStyle?.content ?? {};

        const finalKpiData = kpis?.map((kpi) => ({
            value: kpi.value,
            title: kpi.title,
            subtitle: kpi.subtitle,
            source: kpi.source,
            url: kpi.sourceUrl,
            date: kpi.date,
            sourceStyle: resolveKpiTextStyle(sourceStyle),
            subtitleStyle: resolveKpiTextStyle(subtitleStyle),
            titleStyle: resolveKpiTextStyle(titleStyle),
            valueStyle: resolveKpiTextStyle(valueStyle),
        }));

        return (
            <KPIs
                data={finalKpiData ?? []}
            />
        );
    }

    if (contentType === 'URL') {
        const url = configuration?.url?.url;

        return (
            <iframe
                key={url}
                className={styles.iframe}
                sandbox="allow-scripts allow-same-origin allow-popups"
                title={url}
                src={url}
            />
        );
    }

    if (contentType === 'IMAGE') {
        const caption = configuration?.image?.caption;
        const altText = configuration?.image?.altText;
        const style = configuration?.image?.style;

        const imageContentData = contentData?.[0];

        if (imageContentData && contentDataToFileMap) {
            return (
                <div className={styles.imageContainer}>
                    <img
                        className={styles.image}
                        src={contentDataToFileMap[imageContentData.clientId]?.url ?? ''}
                        alt={altText ?? ''}
                    />
                    {caption && (
                        <div
                            className={styles.caption}
                            style={resolveTextStyle(
                                style?.caption,
                                generalConfiguration?.imageContentStyle?.caption,
                            )}
                        >
                            {caption}
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className={styles.imageContainer}>
                <Message
                    erroredEmptyMessage="Image not found"
                    errored
                />
            </div>
        );
    }

    if (contentType === 'TIMELINE_CHART') {
        const timelineData = dummy;

        return (
            <div className={styles.timeline}>
                <Timeline
                    data={timelineData}
                />
            </div>
        );
    }

    return (
        <Message
            message="This type of content has not been configured yet."
            icon={(
                <Kraken
                    variant="crutches"
                    size="extraSmall"
                />
            )}
        />
    );
}

export default Content;
