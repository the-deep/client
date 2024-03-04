import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
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
import { BasicAnalysisReportUpload } from '#components/report/ReportBuilder/DatasetSelectInput';

import {
    type ContentDataType,
    type ConfigType,
    type ContentConfigType,
} from '../../../schema';
import {
    resolveTextStyle,
    resolveKpiTextStyle,
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

const rawData: Record<string, string | number | undefined>[] = [
    {
        hmgmeqzbs8m0tz3i: '132bf30a-db75-47a6-8c66-55361df6ac42',
        j28h53euavvxy7zg: 'Office',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '1/8/2024',
        '95lvo974ku7grles': '11:30 PM',
        '2mtvloppia78qbnc': 'European Languages',
        '7e3ac3despy870gn': 'Optimized national project',
        qglvj5gw9awto7o2: 'Multi-lateral demand-driven info-mediaries',
        duhumvlxiern5av2: 'Balanced impactful hardware',
        obpqsdq7ko1akfr1: 'Configurable leading edge Graphic Interface',
        j7rphv9voiemo330: 'Universal asynchronous emulation',
        oruecwkfwj8py49s: '10/7/2023',
        cyqo6se5akjny8cz: 87879921,
        eoukx319f5w9emoy: 27776323,
        ukkfcomr1khxrbgg: 97823582,
    },
    {
        hmgmeqzbs8m0tz3i: '9c21bcb0-281d-48c8-9c93-5c7fcb4f3071',
        j28h53euavvxy7zg: 'Office',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '4/22/2023',
        '95lvo974ku7grles': '2:42 PM',
        '2mtvloppia78qbnc': 'Visual SVN',
        '7e3ac3despy870gn': 'Multi-layered 24 hour standardization',
        qglvj5gw9awto7o2: 'Organized executive product',
        duhumvlxiern5av2: 'Innovative eco-centric functionalities',
        obpqsdq7ko1akfr1: 'Fundamental optimizing ability',
        j7rphv9voiemo330: 'Fundamental analyzing capacity',
        oruecwkfwj8py49s: '5/30/2022',
        cyqo6se5akjny8cz: 3008196,
        eoukx319f5w9emoy: 5443595,
        ukkfcomr1khxrbgg: 92484798,
    },
    {
        hmgmeqzbs8m0tz3i: 'd76946f9-5ad2-442e-a6f7-e915d035c7f5',
        j28h53euavvxy7zg: 'Office',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '3/25/2023',
        '95lvo974ku7grles': '6:08 AM',
        '2mtvloppia78qbnc': 'HP Procurve Networking',
        '7e3ac3despy870gn': 'Polarised tertiary circuit',
        qglvj5gw9awto7o2: 'Focused methodical neural-net',
        duhumvlxiern5av2: 'Object-based non-volatile alliance',
        obpqsdq7ko1akfr1: 'Profit-focused modular extranet',
        j7rphv9voiemo330: 'Fully-configurable client-server knowledge user',
        oruecwkfwj8py49s: '8/24/2023',
        cyqo6se5akjny8cz: 81797314,
        eoukx319f5w9emoy: 18561542,
        ukkfcomr1khxrbgg: 48356227,
    },
    {
        hmgmeqzbs8m0tz3i: '41046e05-4f99-43e0-ad03-d1d8aedf90e6',
        j28h53euavvxy7zg: 'Office',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '3/10/2023',
        '95lvo974ku7grles': '5:21 PM',
        '2mtvloppia78qbnc': 'Hospital Sales',
        '7e3ac3despy870gn': 'Digitized foreground algorithm',
        qglvj5gw9awto7o2: 'Managed encompassing neural-net',
        duhumvlxiern5av2: 'Business-focused tangible adapter',
        obpqsdq7ko1akfr1: 'Fundamental 3rd generation standardization',
        j7rphv9voiemo330: 'Cross-platform logistical hardware',
        oruecwkfwj8py49s: '1/29/2023',
        cyqo6se5akjny8cz: 21247382,
        eoukx319f5w9emoy: 10333477,
        ukkfcomr1khxrbgg: 28266345,
    },
    {
        hmgmeqzbs8m0tz3i: '5dc2b74f-3a10-44ff-a6a8-040d4f67da6f',
        j28h53euavvxy7zg: 'Personal',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '7/19/2023',
        '95lvo974ku7grles': '2:29 AM',
        '2mtvloppia78qbnc': 'Typesetting',
        '7e3ac3despy870gn': 'Synergized reciprocal framework',
        qglvj5gw9awto7o2: 'Multi-lateral methodical success',
        duhumvlxiern5av2: 'Self-enabling upward-trending encryption',
        obpqsdq7ko1akfr1: 'Monitored coherent process improvement',
        j7rphv9voiemo330: 'Ergonomic multi-state productivity',
        oruecwkfwj8py49s: '2/20/2023',
        cyqo6se5akjny8cz: 61701549,
        eoukx319f5w9emoy: 93332321,
        ukkfcomr1khxrbgg: 70445173,
    },
    {
        hmgmeqzbs8m0tz3i: '3292a91b-a1dc-485e-90f7-56a947fed63d',
        j28h53euavvxy7zg: 'Entertainment',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '3/5/2022',
        '95lvo974ku7grles': '9:04 PM',
        '2mtvloppia78qbnc': 'DHCP',
        '7e3ac3despy870gn': 'Multi-layered content-based protocol',
        qglvj5gw9awto7o2: 'Innovative multi-state product',
        duhumvlxiern5av2: 'Down-sized upward-trending interface',
        obpqsdq7ko1akfr1: 'Multi-channelled national initiative',
        j7rphv9voiemo330: 'Reduced high-level algorithm',
        oruecwkfwj8py49s: '12/26/2023',
        cyqo6se5akjny8cz: 13640036,
        eoukx319f5w9emoy: 31448787,
        ukkfcomr1khxrbgg: 4701782,
    },
    {
        hmgmeqzbs8m0tz3i: '413a4cef-8f99-4d6c-bdcc-d6926076e0b2',
        j28h53euavvxy7zg: 'Personal',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '2/28/2022',
        '95lvo974ku7grles': '4:03 AM',
        '2mtvloppia78qbnc': 'Objection Handling',
        '7e3ac3despy870gn': 'Managed 6th generation budgetary management',
        qglvj5gw9awto7o2: 'Fundamental fault-tolerant system engine',
        duhumvlxiern5av2: 'Enterprise-wide value-added contingency',
        obpqsdq7ko1akfr1: 'Cross-group multi-tasking flexibility',
        j7rphv9voiemo330: 'Fully-configurable foreground Graphical User Interface',
        oruecwkfwj8py49s: '1/9/2023',
        cyqo6se5akjny8cz: 96572993,
        eoukx319f5w9emoy: 32334976,
        ukkfcomr1khxrbgg: 28919787,
    },
    {
        hmgmeqzbs8m0tz3i: 'caa67b86-cd64-4af9-a36d-4b903a494f03',
        j28h53euavvxy7zg: 'Entertainment',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '1/25/2024',
        '95lvo974ku7grles': '12:27 AM',
        '2mtvloppia78qbnc': 'PPC',
        '7e3ac3despy870gn': 'User-friendly 3rd generation standardization',
        qglvj5gw9awto7o2: 'Fully-configurable well-modulated leverage',
        duhumvlxiern5av2: 'Profit-focused bandwidth-monitored approach',
        obpqsdq7ko1akfr1: 'Total tangible implementation',
        j7rphv9voiemo330: 'Object-based 24 hour moratorium',
        oruecwkfwj8py49s: '2/28/2023',
        cyqo6se5akjny8cz: 1867225,
        eoukx319f5w9emoy: 26232735,
        ukkfcomr1khxrbgg: 12521712,
    },
    {
        hmgmeqzbs8m0tz3i: 'fe056162-6a9f-4b42-806d-b4290243323d',
        j28h53euavvxy7zg: 'Personal',
        '7bzwe1uh4dutgzgq': '',
        o9bqs855t5nehkfd: '5/20/2022',
        '95lvo974ku7grles': '7:40 PM',
        '2mtvloppia78qbnc': 'SRDS',
        '7e3ac3despy870gn': 'Pre-emptive contextually-based functionalities',
        qglvj5gw9awto7o2: 'Front-line human-resource extranet',
        duhumvlxiern5av2: 'Polarised bandwidth-monitored installation',
        obpqsdq7ko1akfr1: 'Function-based content-based concept',
        j7rphv9voiemo330: 'Centralized actuating attitude',
        oruecwkfwj8py49s: '2/18/2023',
        cyqo6se5akjny8cz: 26601519,
        eoukx319f5w9emoy: 23913667,
        ukkfcomr1khxrbgg: 98005803,
    },
];

interface Props {
    contentType: AnalysisReportContainerContentTypeEnum;
    contentData: ContentDataType[] | undefined;
    configuration: ContentConfigType | undefined;
    generalConfiguration: ConfigType | undefined;
    imageReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    quantitativeReportUploads: BasicAnalysisReportUpload[] | undefined | null;
}

function Content(props: Props) {
    const {
        contentType,
        configuration: configurationFromProps,
        generalConfiguration,
        contentData,
        imageReportUploads,
        quantitativeReportUploads,
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
        const selectedImageData = imageReportUploads?.find(
            (item) => item.id === imageContentData?.upload,
        );

        if (imageContentData && selectedImageData) {
            return (
                <div className={styles.imageContainer}>
                    <img
                        className={styles.image}
                        src={selectedImageData?.file?.file?.url ?? ''}
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
        const timelineConfig = configuration?.timelineChart;

        const transformedData = rawData?.map(
            (row) => {
                const {
                    title,
                    detail,
                    date,
                    category,
                    source,
                    sourceUrl,
                } = timelineConfig ?? {};

                if (!date || !title) {
                    return undefined;
                }

                return ({
                    title: String(row[title]),
                    details: isDefined(detail) ? String(row[detail]) : undefined,
                    date: String(row[date]),
                    category: isDefined(category) ? String(row[category]) : undefined,
                    source: isDefined(source) ? String(row[source]) : undefined,
                    link: isDefined(sourceUrl) ? String(row[sourceUrl]) : undefined,
                });
            },
        ).filter(isDefined);

        return (
            <div className={styles.timeline}>
                <Timeline
                    data={transformedData}
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
