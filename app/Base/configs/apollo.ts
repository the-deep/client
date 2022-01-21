import { ApolloClientOptions, NormalizedCacheObject, InMemoryCache, ApolloLink as ApolloLinkFromClient, HttpLink } from '@apollo/client';
import { ApolloLink } from 'apollo-link';
import { RetryLink } from 'apollo-link-retry';
import { createUploadLink } from 'apollo-upload-client';
import { isDefined } from '@togglecorp/fujs';

import { graphqlEndpoint } from './env';

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
        new HttpLink({
            uri: graphqlEndpoint,
            credentials: 'include',
        }) as unknown as ApolloLink,
    ),

]) as unknown as ApolloLinkFromClient;

const apolloOptions: ApolloClientOptions<NormalizedCacheObject> = {
    link,
    cache: new InMemoryCache(),
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

export default apolloOptions;
