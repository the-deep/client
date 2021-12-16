import { ApolloClientOptions, NormalizedCacheObject, InMemoryCache, ApolloLink as ApolloLinkFromClient, HttpLink } from '@apollo/client';
import { ApolloLink } from 'apollo-link';
import { RetryLink } from 'apollo-link-retry';
import { createUploadLink } from 'apollo-upload-client';
import { isDefined } from '@togglecorp/fujs';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT as string;

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
            uri: GRAPHQL_ENDPOINT,
            credentials: 'include',
        }) as unknown as ApolloLink,
        new HttpLink({
            uri: GRAPHQL_ENDPOINT,
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
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
    },
};

export default apolloOptions;
