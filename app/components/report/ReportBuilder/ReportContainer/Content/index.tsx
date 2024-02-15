import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import {
    Message,
    ListView,
    Kraken,
} from '@the-deep/deep-ui';
import ReactMarkdown from 'react-markdown';

import {
    AnalysisReportContainerContentTypeEnum,
} from '#generated/types';

import {
    type ContentDataType,
    type ConfigType,
    type FinalKpiItemType,
    type ContentConfigType,
} from '../../../schema';
import {
    resolveTextStyle,
    type ContentDataFileMap,
} from '../../../utils';
import KpiItem from './KpiItem';

import styles from './styles.css';

type KpiItemType = FinalKpiItemType;

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

    const kpiKeySelector = useCallback(
        (kpi: KpiItemType) => kpi.clientId || '',
        [],
    );

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

        const kpiRendererParams = ((_: string, kpi: KpiItemType) => ({
            value: kpi.value ?? 0,
            title: kpi.title ?? '',
            subtitle: kpi.subtitle ?? '',
            // abbreviateValue: kpi.abbreviateValue,
            sourceTitle: kpi.source,
            sourceUrl: kpi.sourceUrl,
            date: kpi.date,
            sourceStyle,
            subtitleStyle,
            titleStyle,
            valueStyle,
        }));

        return (
            <ListView
                className={styles.kpiContainer}
                data={kpis}
                keySelector={kpiKeySelector}
                renderer={KpiItem}
                rendererParams={kpiRendererParams}
                pending={false}
                filtered={false}
                errored={false}
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
