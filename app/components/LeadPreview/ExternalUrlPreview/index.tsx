import React, { useState, useMemo } from 'react';
import { PendingMessage } from '@the-deep/deep-ui';

import { useRequest } from '#utils/request';
import {
    MimeTypes,
} from '../Preview/mimeTypes';

import Viewer from '../Preview';

// NOTE: Need to confirm if this is necessary
// This is only necessary if even the keys might be differently cased
function getHeaderValue(headers: { [key in string]: string | undefined }, header: string) {
    const tHeader = Object.keys(headers).find(
        (key) => key.toLowerCase() === header.toLowerCase(),
    );
    if (!tHeader) {
        return undefined;
    }
    return headers[tHeader];
}

interface UrlDetails {
    httpUrl?: string;
    httpsUrl?: string;
    headers: {
        'Content-Type'?: string;
        'X-Frame-Options'?: string;
        'Content-Security-Policy'?: string;
    };
}

interface Props {
    className?: string;
    url: string;
}

function ExternalUrlPreview(props: Props) {
    const {
        className,
        url,
    } = props;

    const [canShowIframe, setCanShowIframe] = useState(false);
    const [mimeType, setMimeType] = useState<MimeTypes | undefined>();

    const query = useMemo(() => ({
        url,
    }), [url]);

    const {
        pending,
        response: urlDetailsResponse,
    } = useRequest<UrlDetails>({
        url: 'server://lead-website-fetch/',
        query,
        onSuccess: ({ headers }) => {
            const contentType = getHeaderValue(headers, 'Content-Type');
            setMimeType(contentType?.split(';')[0].trim() as MimeTypes);

            const xFrameOptions = getHeaderValue(headers, 'X-Frame-Options');
            const contentSecurityPolicy = getHeaderValue(headers, 'Content-Security-Policy');
            let tempCanShowIframe = true;

            // Older policy
            if (xFrameOptions) {
                const options = xFrameOptions.toLowerCase();
                // TODO: allow-from check if deep url is allowed
                if (options.match('sameorigin|deny|allow-from')) {
                    tempCanShowIframe = false;
                }
            }

            // New policy
            if (canShowIframe && contentSecurityPolicy) {
                const options = contentSecurityPolicy.toLowerCase();
                // TODO: uri check if deep url is allowed
                if (options.match('frame-ancestors')) {
                    tempCanShowIframe = false;
                }
            }

            setCanShowIframe(tempCanShowIframe);
        },
    });

    if (pending) {
        return (
            <div className={className}>
                <PendingMessage
                    message="Gathering website information for preview."
                />
            </div>
        );
    }

    return (
        <Viewer
            className={className}
            url={urlDetailsResponse?.httpsUrl ?? url}
            mimeType={mimeType ?? 'text/html'}
            canShowIframe={canShowIframe}
        />
    );
}

export default ExternalUrlPreview;
