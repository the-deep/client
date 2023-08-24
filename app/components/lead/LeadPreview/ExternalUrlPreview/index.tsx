import React, { useState, useMemo } from 'react';
import { PendingMessage } from '@the-deep/deep-ui';

import { useRequest } from '#base/utils/restRequest';

import {
    MimeTypes,
} from '../Preview/mimeTypes';

import Preview from '../Preview';

const proxyMap: { [key in string]: string } = {
    'reliefweb.int': 'reliefweb-int.preview-proxy.thedeep.io',
    'data2.unhcr.org': 'data2-unhcr-org.preview-proxy.thedeep.io',
    'data.unhcr.org': 'data-unhcr-org.preview-proxy.thedeep.io',
    'www.who.int': 'www-who-int.preview-proxy.thedeep.io',
    'apps.who.int': 'apps-who-int.preview-proxy.thedeep.io',
};

function getProxiedUrl(url: string) {
    let urlObject: URL;
    try {
        urlObject = new URL(url);
    } catch {
        return url;
    }
    const proxyUrl = proxyMap[urlObject.host];
    if (proxyUrl) {
        urlObject.host = proxyUrl;
        return urlObject.toString();
    }
    return url;
}

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
    const [updatedUrl, setUpdatedUrl] = useState<string | undefined>();

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

            let urlObject: URL | undefined;
            try {
                urlObject = new URL(url);
            } catch {
                // eslint-disable-next-line no-console
                console.error('undefined URL');
            }

            const redirectLocation = getHeaderValue(headers, 'Location');
            if (redirectLocation && urlObject?.host) {
                const newUrl = `https://${urlObject.host}/${encodeURIComponent(redirectLocation)}`;
                setUpdatedUrl(newUrl);
            }

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

            setCanShowIframe(
                (urlObject?.host && proxyMap[urlObject.host]) ? true : tempCanShowIframe,
            );
        },
    });

    const proxiedUrl = useMemo(() => (
        getProxiedUrl(updatedUrl ?? urlDetailsResponse?.httpsUrl ?? url)
    ), [urlDetailsResponse?.httpsUrl, url, updatedUrl]);

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
        <Preview
            className={className}
            url={proxiedUrl}
            mimeType={mimeType ?? 'text/html'}
            canShowIframe={canShowIframe}
        />
    );
}

export default ExternalUrlPreview;
