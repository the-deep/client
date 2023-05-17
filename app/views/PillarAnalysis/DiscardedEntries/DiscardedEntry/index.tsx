import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import { AiOutlineUndo } from 'react-icons/ai';

import {
    Container,
    PendingMessage,
    Tag,
    QuickActionConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';

import ExcerptInput from '#components/entry/ExcerptInput';
import _ts from '#ts';
import {
    UndiscardEntryMutation,
    UndiscardEntryMutationVariables,
} from '#generated/types';

import { Entry } from '../..';

import styles from './styles.css';

const UNDISCARD_ENTRY = gql`
    mutation UndiscardEntry(
        $projectId: ID!,
        $discardedEntryId: ID!,
    ) {
        project(id: $projectId) {
            discardedEntryDelete(id: $discardedEntryId) {
                ok
                errors
            }
        }
    }
`;

export interface Props {
    className?: string;
    discardedEntryId: string;
    tagDisplay: string;
    onEntryUndiscard: () => void;
    projectId: string;

    excerpt: Entry['excerpt'];
    image?: Entry['image'];
    entryType: Entry['entryType'];
}

function DiscardedEntry(props: Props) {
    const {
        className,
        discardedEntryId,
        projectId,
        onEntryUndiscard,
        tagDisplay,
        entryType,
        excerpt,
        image,
    } = props;

    const alert = useAlert();

    const variables = useMemo(() => ({
        projectId,
        discardedEntryId,
    }), [
        projectId,
        discardedEntryId,
    ]);
    const [
        undiscardEntry,
        {
            loading: undiscardEntryPending,
        },
    ] = useMutation<UndiscardEntryMutation, UndiscardEntryMutationVariables>(
        UNDISCARD_ENTRY,
        {
            variables,
            onCompleted: (response) => {
                const undiscardEntryResponse = response?.project?.discardedEntryDelete;
                if (!undiscardEntryResponse) {
                    return;
                }

                const {
                    ok,
                } = undiscardEntryResponse;

                if (ok) {
                    alert.show(
                        'Successfully discarded selected entry.',
                        {
                            variant: 'success',
                        },
                    );
                    if (onEntryUndiscard) {
                        onEntryUndiscard();
                    }
                } else if (!ok) {
                    alert.show(
                        'Failed to undiscarded entry.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to undiscarded entry.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleUndiscardClick = useCallback(() => {
        undiscardEntry();
    }, [undiscardEntry]);

    return (
        <Container
            className={_cs(className, styles.entryItem)}
            contentClassName={_cs(
                styles.children,
                entryType === 'IMAGE' && styles.image,
            )}
            footerIcons={(
                <Tag>
                    {tagDisplay}
                </Tag>
            )}
            footerActions={(
                <QuickActionConfirmButton
                    name="undiscard"
                    title="Undiscard entry"
                    disabled={undiscardEntryPending}
                    onConfirm={handleUndiscardClick}
                    message={_ts('pillarAnalysis', 'confirmUndiscardEntryMessage')}
                    showConfirmationInitially={false}
                >
                    <AiOutlineUndo />
                </QuickActionConfirmButton>
            )}
        >
            {undiscardEntryPending && (<PendingMessage />)}
            <ExcerptInput
                entryType={entryType}
                image={image}
                value={excerpt}
                imageRaw={undefined}
                leadImageUrl={undefined}
                readOnly
            />
        </Container>
    );
}

export default DiscardedEntry;
