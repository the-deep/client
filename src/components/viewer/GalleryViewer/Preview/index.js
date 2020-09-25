import PropTypes from 'prop-types';
import React from 'react';

import Message from '#rscv/Message';
import urlRegex from '#rsu/regexForWeburl';

import { galleryMapping, galleryType } from '#config/deepMimeTypes';
import _ts from '#ts';

import GalleryImage from './GalleryImage';
import GalleryDocs from './GalleryDocs';

import styles from './styles.scss';

function isUrlValid(url) {
    return url && urlRegex.test(url);
}

/*
 * Document [pdf, image, docx, html, txt] viewer handler
 * Use required document viewer according to the mime-type
*/
function Preview(props) {
    const {
        className,

        url,
        mimeType,

        canShowIframe,

        cannotPreviewUrlMessage,
        invalidUrlMessage,
        unsupportedTypeMessage,

        error,
    } = props;

    if (error) {
        return (
            <Message className={styles.errorUrl}>
                {error}
            </Message>
        );
    }

    const isHttps = !!(url || '').match(/^https:\/\//) || window.location.protocol === 'http:';

    if (galleryMapping[mimeType] === galleryType.IMAGE) {
        // NOTE: Error can occur if
        // 1. If there is no alternative https url and current url is http
        const previewError = !isHttps;
        if (previewError) {
            return (
                <Message className={styles.errorUrl}>
                    {cannotPreviewUrlMessage || _ts('components.galleryViewer', 'cannotPreviewUrl')}
                </Message>
            );
        }
        return (
            <GalleryImage
                className={className}
                imageUrl={url}
            />
        );
    } else if (galleryMapping[mimeType] === galleryType.DOC) {
        // NOTE: no need to check for https for GalleryDocs as it has google viewer as fallback
        return (
            <GalleryDocs
                className={className}
                docUrl={url}
                mimeType={mimeType}
                canShowIframe={canShowIframe}
                notHttps={!isHttps}
            />
        );
    } else if (galleryMapping[mimeType] === galleryType.HTML || url.endsWith('txt')) {
        if (!url || !isUrlValid(url)) {
            return (
                <Message className={styles.errorUrl}>
                    {invalidUrlMessage || _ts('components.galleryViewer', 'invalidUrl')}
                </Message>
            );
        }
        // NOTE: Error can occur if
        // 1. We cannot show iframe
        // 2. If there is no alternative https url and current url is http
        const previewError = !canShowIframe || !isHttps;
        if (previewError) {
            return (
                <Message className={styles.errorUrl}>
                    {cannotPreviewUrlMessage || _ts('components.galleryViewer', 'cannotPreviewUrl')}
                </Message>
            );
        }

        return (
            <iframe
                className={className}
                sandbox="allow-scripts allow-same-origin"
                title={url}
                src={url}
            />
        );
    }

    return (
        <Message className={styles.errorUrl}>
            {unsupportedTypeMessage || _ts('components.galleryViewer', 'unsupportedType')}
        </Message>
    );
}

Preview.propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    mimeType: PropTypes.string,
    canShowIframe: PropTypes.bool,

    invalidUrlMessage: PropTypes.string,
    cannotPreviewUrlMessage: PropTypes.string,
    unsupportedTypeMessage: PropTypes.string,

    error: PropTypes.string,
};

Preview.defaultProps = {
    className: '',
    url: '',
    mimeType: '',
    canShowIframe: false,

    invalidUrlMessage: undefined,
    cannotPreviewUrlMessage: undefined,
    unsupportedTypeMessage: undefined,

    error: undefined,
};

export default Preview;
