import React from 'react';
import { removeNull } from '@togglecorp/toggle-form';
import {
    Heading,
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

import styles from './styles.css';

const variantToSizeMapping = {
    H1: 'extraLarge',
    H2: 'large',
    H3: 'medium',
    H4: 'small',
} as const;

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
            } = {},
        } = configuration;
        return (
            <Heading
                size={variant ? variantToSizeMapping[variant] : 'extraLarge'}
            >
                {content ?? 'Title goes here'}
            </Heading>
        );
    }

    if (contentType === 'TEXT') {
        const {
            text: {
                content,
            } = {},
        } = configuration;

        return (
            <ReactMarkdown className={styles.markdown}>
                {content ?? 'Content goes here'}
            </ReactMarkdown>
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
