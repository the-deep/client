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
import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import {
    type ContentDataType,
    type ConfigType,
    type ContentConfigType,
} from '../../../schema';
import {
    resolveTextStyle,
} from '../../../utils';
import MapContent from './MapContent';
import BarContent from './BarContent';

import styles from './styles.css';

type TimelineCacheData = Record<string, string | number | undefined>[] | undefined;

interface Props {
    contentType: AnalysisReportContainerContentTypeEnum;
    contentData: ContentDataType[] | undefined;
    configuration: ContentConfigType | undefined;
    generalConfiguration: ConfigType | undefined;
    imageReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    downloadsPending: boolean;
    downloadedGeoData: Record<string, unknown>;
}

function Content(props: Props) {
    const {
        contentType,
        configuration: configurationFromProps,
        generalConfiguration,
        contentData,
        downloadsPending,
        imageReportUploads,
        downloadedGeoData,
        geoDataUploads,
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
        const sourceStyle = configuration?.kpi?.sourceContentStyle ?? {};
        const subtitleStyle = configuration?.kpi?.subtitleContentStyle ?? {};
        const titleStyle = configuration?.kpi?.titleContentStyle ?? {};
        const valueStyle = configuration?.kpi?.valueContentStyle ?? {};

        const finalKpiData = kpis?.map((kpi) => ({
            value: kpi.value,
            title: kpi.title,
            subtitle: kpi.subtitle,
            source: kpi.source,
            url: kpi.sourceUrl,
            date: kpi.date,
            backgroundColor: kpi.color ?? '#f0f0f0',
            sourceStyle: resolveTextStyle(kpi.style?.sourceContentStyle, sourceStyle),
            subtitleStyle: resolveTextStyle(kpi.style?.subtitleContentStyle, subtitleStyle),
            titleStyle: resolveTextStyle(kpi.style?.titleContentStyle, titleStyle),
            valueStyle: resolveTextStyle(kpi.style?.valueContentStyle, valueStyle),
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
        const timelineContentData = contentData?.[0]?.data as TimelineCacheData;

        const transformedData = timelineContentData?.map(
            (row) => {
                const {
                    title,
                    details,
                    date,
                    category,
                    source,
                    sourceUrl,
                } = row;

                if (!date || !title) {
                    return undefined;
                }

                return ({
                    title: String(title),
                    details: isDefined(details) ? String(details) : String(title),
                    date: String(new Date(date)),
                    category: isDefined(category) ? String(category) : undefined,
                    source: isDefined(source) ? String(source) : undefined,
                    link: isDefined(sourceUrl) ? String(sourceUrl) : undefined,
                });
            },
        ).filter(isDefined);

        return (
            <div className={styles.timeline}>
                <Timeline
                    data={transformedData ?? []}
                />
            </div>
        );
    }

    if (contentType === 'BAR_CHART') {
        const barChartContentData = contentData?.[0];

        return (
            <BarContent
                configuration={configuration?.barChart}
                cacheData={
                    barChartContentData?.data as (
                        Record<string, string | number | undefined>[] | undefined
                    )
                }
            />
        );
    }

    if (contentType === 'MAP') {
        return (
            <MapContent
                configuration={configuration?.map}
                contentData={contentData}
                downloadedGeoData={downloadedGeoData}
                downloadsPending={downloadsPending}
                geoDataUploads={geoDataUploads}
            />
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
