import PropTypes from 'prop-types';
import React from 'react';

import { createUrlForGoogleViewer } from '#rest/external';
import _cs from '#cs';

import styles from './styles.scss';

export { galleryDocsMimeType as supportedMimeType } from '#config/deepMimeTypes';

const propTypes = {
    className: PropTypes.string,
    docUrl: PropTypes.string,
    mimeType: PropTypes.string,

    // can the docUrl be shown in iframe
    canShowIframe: PropTypes.bool,
    // is the docUrl https
    notHttps: PropTypes.bool,
};

const defaultProps = {
    className: '',
    docUrl: undefined,
    mimeType: undefined,
    canShowIframe: true,
    notHttps: false,
};

/*
 * Gallery viewer component for Docs [galleryDocsMimeType]
 */
function GalleryDocs(props) {
    const {
        className: classNameFromProps,
        docUrl,
        mimeType,
        canShowIframe,
        notHttps,
    } = props;

    if (!docUrl) {
        return null;
    }

    const className = _cs(
        classNameFromProps,
        'gallery-docs',
        styles.galleryDocs,
    );

    // NOTE: Google also support pdf for viewing but it does not work for localhost
    const digestablePdf = mimeType === 'application/pdf' && canShowIframe && !notHttps;
    if (digestablePdf) {
        return (
            <div className={className}>
                <embed
                    className={_cs('doc', styles.doc)}
                    type="application/pdf"
                    src={docUrl}
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <iframe
                className={_cs('doc', styles.doc)}
                title={docUrl}
                src={createUrlForGoogleViewer(docUrl)}
                sandbox="allow-scripts allow-same-origin allow-popups"
            />
        </div>
    );
}
GalleryDocs.propTypes = propTypes;
GalleryDocs.defaultProps = defaultProps;

export default GalleryDocs;
