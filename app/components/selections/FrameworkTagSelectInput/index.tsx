import React, { useMemo, useCallback } from 'react';
import {
    Button,
    BadgeInput,
    BadgeInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    FrameworkTagOptionsQuery,
    FrameworkTagOptionsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const FRAMEWORK_TAGS = gql`
    query FrameworkTagOptions(
        $page: Int,
        $pageSize: Int,
    ) {
        analysisFrameworkTags(
            page: $page,
            pageSize: $pageSize,
        ) {
            page
            pageSize
            results {
                description
                id
                title
                icon {
                    name
                    url
                }
            }
            totalCount
        }
    }
`;

const PAGE_SIZE = 10;

type BasicFrameworkTag = NonNullable<NonNullable<NonNullable<FrameworkTagOptionsQuery>['analysisFrameworkTags']>['results']>[number];
const keySelector = (item: BasicFrameworkTag) => item.id;
const labelSelector = (item: BasicFrameworkTag) => item.title;
const titleSelector = (item: BasicFrameworkTag) => item.description;
function iconSelector(item: BasicFrameworkTag) {
    if (!item.icon?.url) {
        return undefined;
    }
    return (
        <img
            className={styles.icon}
            src={item.icon.url}
            alt={item.icon.url}
        />
    );
}

type Props<N extends string> = Omit<
    BadgeInputProps<BasicFrameworkTag, N, string>,
    'options' | 'keySelector' | 'labelSelector'
>;

function FrameworkTagSelectInput<N extends string>(
    props: Props<N>,
) {
    const variables = useMemo(() => ({
        page: 1,
        pageSize: PAGE_SIZE,
    }), []);

    const {
        data,
        fetchMore,
    } = useQuery<FrameworkTagOptionsQuery, FrameworkTagOptionsQueryVariables>(
        FRAMEWORK_TAGS,
        {
            variables,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.analysisFrameworkTags?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.analysisFrameworkTags) {
                    return previousResult;
                }

                const oldFrameworkTags = previousResult.analysisFrameworkTags;
                const newFrameworkTags = fetchMoreResult?.analysisFrameworkTags;

                if (!newFrameworkTags) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    analysisFrameworkTags: {
                        ...newFrameworkTags,
                        results: [
                            ...(oldFrameworkTags.results ?? []),
                            ...(newFrameworkTags.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        data?.analysisFrameworkTags?.page,
        fetchMore,
        variables,
    ]);

    return (
        <>
            <BadgeInput
                {...props}
                keySelector={keySelector}
                labelSelector={labelSelector}
                titleSelector={titleSelector}
                iconSelector={iconSelector}
                options={data?.analysisFrameworkTags?.results ?? undefined}
                smallButtons
            />
            {(data?.analysisFrameworkTags?.totalCount ?? 0)
                > (data?.analysisFrameworkTags?.results ?? []).length && (
                <Button
                    onClick={handleShowMoreClick}
                    name={undefined}
                    spacing="compact"
                    variant="transparent"
                >
                    Show more tags
                </Button>
            )}
        </>
    );
}

export default FrameworkTagSelectInput;
