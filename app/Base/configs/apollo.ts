import {
    ApolloClient,
    ApolloClientOptions,
    NormalizedCacheObject,
    InMemoryCache,
    ApolloLink as ApolloLinkFromClient,
    HttpLink,
} from '@apollo/client';
import { ApolloLink } from 'apollo-link';
import { RestLink } from 'apollo-link-rest';
import { RetryLink } from 'apollo-link-retry';
import { createUploadLink } from 'apollo-upload-client';
import { isDefined } from '@togglecorp/fujs';

import {
    staticEndpoint,
    graphqlEndpoint,
} from './env';

const restLink = new RestLink({
    endpoints: {
        static: staticEndpoint,
    },
    credentials: 'omit',
});

const graphqlLink = new HttpLink({
    uri: graphqlEndpoint,
    credentials: 'include',
});

const link: ApolloLinkFromClient = ApolloLink.from([
    new RetryLink({
        attempts: {
            max: 5,
            retryIf: (error: { statusCode: number | undefined }) => (
                isDefined(error.statusCode) && error.statusCode < 400
            ),
        },
    }),
    ApolloLink.split(
        (operation) => operation.getContext().hasUpload,
        createUploadLink({
            uri: graphqlEndpoint,
            credentials: 'include',
        }) as unknown as ApolloLink,
        ApolloLink.from([
            restLink as unknown as ApolloLink,
            graphqlLink as unknown as ApolloLink,
        ]),
    ),

]) as unknown as ApolloLinkFromClient;

const apolloOptions: ApolloClientOptions<NormalizedCacheObject> = {
    link,
    cache: new InMemoryCache({
        typePolicies: {
            // NOTE: empty keyFields means this is a singleton object
            UnifiedConnectorQueryType: {
                keyFields: [],
            },
            ExploreDashboardStatType: {
                keyFields: [],
            },
            AssistedTaggingQueryType: {
                keyFields: [],
            },
            AssistedTaggingMutationType: {
                keyFields: [],
            },
            AssessmentDashboardStatisticsType: {
                keyFields: [],
            },
        },
    }),
    assumeImmutableResults: true,
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        watchQuery: {
            // NOTE: setting nextFetchPolicy to cache-and-network is risky
            fetchPolicy: 'network-only',
            nextFetchPolicy: 'cache-only',
            errorPolicy: 'all',
        },
    },
};

// eslint-disable-next-line import/prefer-default-export
export const apolloClient = new ApolloClient(apolloOptions);
