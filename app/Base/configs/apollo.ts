import { ApolloClientOptions, NormalizedCacheObject, InMemoryCache, ApolloLink as ApolloLinkFromClient, HttpLink } from '@apollo/client';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT as string;

const link = new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: 'include',
}) as unknown as ApolloLinkFromClient;

/*
const link: ApolloLinkFromClient = ApolloLink.from([
    new RetryLink(),
    ApolloLink.split(
        (operation) => operation.getContext().hasUpload,
        createUploadLink({
            uri: GRAPHQL_ENDPOINT,
            credentials: 'include',
        }) as unknown as ApolloLink,
        ApolloLink.from([
            new RestLink({
                uri: 'https://osmnames.idmcdb.org',
            }) as unknown as ApolloLink,
            new BatchHttpLink({
                uri: GRAPHQL_ENDPOINT,
                credentials: 'include',
            }),
        ]),
    ),
]) as unknown as ApolloLinkFromClient;
*/

const apolloOptions: ApolloClientOptions<NormalizedCacheObject> = {
    link,
    cache: new InMemoryCache(),
    assumeImmutableResults: true,
    defaultOptions: {
        query: {
            fetchPolicy: 'cache-first',
            // fetchPolicy: 'cache-first',
            errorPolicy: 'all',
        },
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            // NOTE: https://github.com/apollographql/apollo-client/issues/7346#issuecomment-730275343
            // Setting nextFetchPolicy to stop duplicate queries call
            nextFetchPolicy: 'cache-first',
            // fetchPolicy: 'cache-first',
            errorPolicy: 'all',
        },
    },
};

export default apolloOptions;
