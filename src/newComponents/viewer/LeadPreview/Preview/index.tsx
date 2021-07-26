import React from 'react';
import {
    _cs,
    isValidUrl,
} from '@togglecorp/fujs';
import {
    ImagePreview,
} from '@the-deep/deep-ui';

import { isHttps } from '#utils/safeCommon';

import {
    MimeTypes,
    isImageMimeType,
    isDocMimeType,
    isHTMLMimeType,
    createUrlForGoogleViewer,
} from './mimeTypes';

import styles from './styles.scss';

interface Props {
    className?: string;
    url: string;
    mimeType: MimeTypes;
    canShowIframe: boolean;
}

function Preview(props: Props) {
    const {
        className,
        url,
        mimeType,
        canShowIframe,
    } = props;

    const isRunningInHTTP = window.location.protocol === 'http:';
    const isCurrentUrlHTTPs = isHttps(url);

    // NOTE: We are checking if current URL is https or the system is running in
    // http mode because http url shouldn't be embedded under http env
    if (isImageMimeType(mimeType) && (isCurrentUrlHTTPs || isRunningInHTTP)) {
        return (
            <ImagePreview
                alt=""
                src={url}
                className={className}
            />
        );
    } else if (isDocMimeType(mimeType)) {
        // FIXME: We need to confirm this logic
        const useGoogle = mimeType !== 'application/pdf'
            || !(isCurrentUrlHTTPs || isRunningInHTTP)
            || !canShowIframe;

        const src = useGoogle
            ? createUrlForGoogleViewer(url)
            : url;
        const sandbox = useGoogle
            ? 'allow-scripts allow-same-origin allow-popups'
            : undefined;

        return (
            <iframe
                title={url}
                src={src}
                className={_cs(className, styles.viewer)}
                sandbox={sandbox}
            />
        );
    } else if (
        (isHTMLMimeType(mimeType) || url.endsWith('txt'))
        && canShowIframe
        && (isCurrentUrlHTTPs || isRunningInHTTP)
    ) {
        // NOTE: Error can occur if
        // 1. We cannot show iframe
        // 2. If there is no alternative https url and current url is http
        return (
            <iframe
                sandbox="allow-scripts allow-same-origin"
                title={url}
                className={_cs(className, styles.viewer)}
                src={url}
            />
        );
    }

    return (
        <div className={_cs(styles.viewer, className)}>
            {isValidUrl(url)
                ? 'Failed to preview current URL.'
                : 'The entered url is not valud.'
            }
        </div>
    );
}

export default Preview;
