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
    canShowIframe: PropTypes.bool,
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
export default class GalleryDocs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            docUrl,
            mimeType,
            canShowIframe,
            notHttps,
        } = this.props;

        if (!docUrl) {
            return null;
        }

        const useGoogle = mimeType !== 'application/pdf' || !canShowIframe || notHttps;
        const src = useGoogle
            ? createUrlForGoogleViewer(docUrl)
            : docUrl;
        const sandbox = useGoogle
            ? 'allow-scripts allow-same-origin allow-popups'
            : undefined;

        const className = _cs(
            classNameFromProps,
            'gallery-docs',
            styles.galleryDocs,
        );

        return (
            <div className={className}>
                <iframe
                    className={`doc ${styles.doc}`}
                    title={docUrl}
                    src={src}
                    sandbox={sandbox}
                />
            </div>
        );
    }
}
