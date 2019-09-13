import { isValidUrl } from '@togglecorp/fujs';
import { requestMethods } from '#request';
import _ts from '#ts';
import notify from '#notify';

export const xmlConnectorTypes = [
    'rss-feed',
    'atom-feed',
    'emm',
];

export const getFeedUrl = ({ faramValues = {} }) => {
    const { params: { 'feed-url': feedUrl } = {} } = faramValues;
    return feedUrl;
};

export const needToFetchOptions = (sourceKey, connectorDetails) => {
    if (!xmlConnectorTypes.includes(sourceKey)) {
        return false;
    }
    const feedUrl = getFeedUrl(connectorDetails);
    return feedUrl && isValidUrl(feedUrl);
};

export const requests = {
    rssOptionsRequest: {
        url: ({ props: { connectorSource } }) => `/connector-sources/${connectorSource.key}/fields/`,
        query: ({ props: { connectorDetails } }) => ({ 'feed-url': getFeedUrl(connectorDetails) }),
        onMount: ({
            props: {
                connectorDetails,
                connectorSource,
            },
        }) =>
            needToFetchOptions(connectorSource.key, connectorDetails),
        onPropsChanged: {
            connectorDetails: ({
                props: {
                    connectorDetails,
                    connectorSource,
                },
            }) => needToFetchOptions(connectorSource.key, connectorDetails),
        },
        method: requestMethods.GET,
        onFailure: ({
            response,
            props: {
                setErrorUserConnectorDetails,
                connectorId,
            },
        }) => {
            const faramErrors = {
                params: response,
                $internal: response.$internal,
            };
            setErrorUserConnectorDetails({
                faramErrors,
                connectorId,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('entries', 'entriesTabLabel'),
                type: notify.type.ERROR,
                message: _ts('connector', 'connectorGetFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        schemaName: 'rssOptions',
    },
    connectorDeleteRequest: {
        url: ({ props: { connectorId } }) => `/connectors/${connectorId}/`,
        method: requestMethods.DELETE,
        onSuccess: ({ props: {
            onConnectorDelete,
            deleteConnector,
            connectorId,
        } }) => {
            deleteConnector({ connectorId });
            onConnectorDelete();
        },
        onFailure: ({ response }) => {
            notify.send({
                title: _ts('connector', 'connectorTitle'),
                type: notify.type.ERROR,
                message: response.$internal.join(' '),
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('connector', 'connectorTitle'),
                type: notify.type.ERROR,
                message: _ts('connector', 'connectorDeleteFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
    },
};
