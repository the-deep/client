import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import {
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import ReactMarkdown from 'react-markdown';

import {
    AnalysisReportContainerContentTypeEnum,
    AnalysisReportContainerContentConfigurationType,
} from '#generated/types';

import { ContentDataFileMap } from '../../../index';
import { ContentDataType } from '../../../schema';
import { resolveTextStyle } from '../../../utils';

import styles from './styles.css';

interface Props {
    contentType: AnalysisReportContainerContentTypeEnum;
    contentData: ContentDataType[] | undefined;
    configuration: AnalysisReportContainerContentConfigurationType | undefined;
    contentDataToFileMap: ContentDataFileMap | undefined;
}

function Content(props: Props) {
    const {
        contentType,
        configuration: configurationFromProps = {},
        contentData,
        contentDataToFileMap,
    } = props;

    const configuration = removeNull(configurationFromProps);

    if (contentType === 'HEADING') {
        const {
            heading: {
                content,
                variant,
                style,
            } = {},
        } = configuration;

        if (variant === 'H4') {
            return (
                <h4
                    className={_cs(
                        styles.heading,
                        styles.headingFour,
                    )}
                    style={resolveTextStyle(style?.content)}
                >
                    {content ?? 'Title goes here'}
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
                    style={resolveTextStyle(style?.content)}
                >
                    {content ?? 'Title goes here'}
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
                    style={resolveTextStyle(style?.content)}
                >
                    {content ?? 'Title goes here'}
                </h2>
            );
        }
        return (
            <h1
                className={_cs(
                    styles.heading,
                    styles.headingOne,
                )}
                style={resolveTextStyle(style?.content)}
            >
                {content ?? 'Title goes here'}
            </h1>
        );
    }

    if (contentType === 'TEXT') {
        const {
            text: {
                content,
                style,
            } = {},
        } = configuration;

        return (
            <div
                style={resolveTextStyle(style?.content)}
            >
                <ReactMarkdown className={styles.markdown}>
                    {content ?? 'Content goes here'}
                </ReactMarkdown>
            </div>
        );
    }

    if (contentType === 'URL') {
        const {
            url: {
                url,
            } = {},
        } = configuration;
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
        const {
            image: {
                altText,
            } = {},
        } = configuration;

        const imageContentData = contentData?.[0];

        if (imageContentData && contentDataToFileMap) {
            return (
                <img
                    className={styles.image}
                    src={contentDataToFileMap[imageContentData.clientId]?.url ?? ''}
                    alt={altText ?? ''}
                />
            );
        }
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
