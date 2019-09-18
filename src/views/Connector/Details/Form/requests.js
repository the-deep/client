import { requestMethods } from '#request';
import _ts from '#ts';
import notify from '#notify';
import {
    getFeedUrl,
    needToFetchOptions,
} from './connector-utils';

const requests = {
    xmlFieldOptionsRequest: {
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
                prevProps: {
                    connectorDetails: prevConnectorDetails,
                },
                props: {
                    connectorDetails,
                    connectorSource,
                },
            }) => {
                if (getFeedUrl(connectorDetails) === getFeedUrl(prevConnectorDetails)) {
                    return false;
                }
                return needToFetchOptions(connectorSource.key, connectorDetails);
            },
        },
        method: requestMethods.GET,
        onSuccess: ({
            response: { hasEmm },
            params: { setFaramError },
            props: { connectorSource },
        }) => {
            if (connectorSource.key === 'emm' && !hasEmm) {
                setFaramError();
            }
        },
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
        schemaName: 'xmlFieldOptions',
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

export default requests;
