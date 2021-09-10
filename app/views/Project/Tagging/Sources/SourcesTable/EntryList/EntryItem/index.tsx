import React, { useState, useContext, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import {
    Button,
    ButtonLikeLink,
    Container,
    useAlert,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';
import { IoTrash } from 'react-icons/io5';

import { useLazyRequest } from '#base/utils/restRequest';
import ProjectContext from '#base/context/ProjectContext';
import useRouteMatching from '#base/hooks/useRouteMatching';
import routes from '#base/configs/routes';
import {
    DeleteEntryMutation,
    DeleteEntryMutationVariables,
} from '#generated/types';
import {
    Framework,
    Entry,
} from '../../types';

import EntryListItem from '#components/entry/EntryListItem';
/*
import EntryVerification from '#components/entryReview/EntryVerification';
 */
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';

import styles from './styles.css';

export const DELETE_ENTRY = gql`
    mutation deleteEntry(
        $entry: ID!
        $id: ID!
    ){
        project(id: $id){
            entryDelete(id: $entry) {
                ok
            }
        }
    }
`;

interface Props {
    className?: string;
    entry: Entry;
    projectId: string;
    leadId: string;
    framework: Framework | undefined | null;
    onSuccess: () => void;
}

function EntryItem(props: Props) {
    const {
        className,
        projectId,
        leadId,
        entry: entryFromProps,
        framework,
        onSuccess,
    } = props;

    const { project } = useContext(ProjectContext);
    const [entry, setEntry] = useState<Entry>(entryFromProps);
    const alert = useAlert();

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

    const route = useRouteMatching(
        routes.entryEdit,
        {
            projectId,
            leadId,
        },
    );

    const entryEditLink = route?.to ?? '';

    const {
        pending,
        trigger: getEntry,
    } = useLazyRequest<Entry, number>({
        url: (ctx) => `server://v2/entries/${ctx}/`,
        method: 'GET',
        onSuccess: (response) => {
            setEntry(response);
        },
        failureHeader: 'Entry',
    });

    const [
        deleteEntry,
        { loading: deleteEntryPending },
    ] = useMutation<DeleteEntryMutation, DeleteEntryMutationVariables>(
        DELETE_ENTRY,
        {
            onCompleted: () => {
                alert.show(
                    'Successfully deleted entry.',
                    {
                        variant: 'success',
                    },
                );
                onSuccess();
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );

    const handleDeleteEntryClick = useCallback(() => {
        deleteEntry({
            variables: {
                id: projectId,
                entry: entry.id,
            },
        });
    }, []);

    return (
        <Container
            className={_cs(className, styles.entryItemContainer)}
            headerClassName={styles.header}
            contentClassName={styles.content}
            headerIcons={(
                <div className={styles.actions}>
                    {canEditEntry && (
                        <>
                            <ButtonLikeLink
                                className={styles.button}
                                variant="secondary"
                                to={entryEditLink}
                                icons={(
                                    <FiEdit2 />
                                )}
                            >
                                Edit Tags
                            </ButtonLikeLink>
                            <EntryComments
                                className={styles.button}
                                // FIXME: Remove cast after entry comments
                                // is switched to gql
                                entryId={+entry.id}
                                projectId={+projectId}
                            />
                            <Button
                                name="delete entry"
                                className={styles.button}
                                variant="secondary"
                                onClick={handleDeleteEntryClick}
                                disabled={deleteEntryPending}
                                icons={(
                                    <IoTrash />
                                )}
                            >
                                Delete Entry
                            </Button>

                            {/*
                            <EntryVerification
                                className={styles.button}
                                entryId={entry.id}
                                projectId={entry.project}
                                verifiedBy={entry.verifiedBy}
                                onVerificationChange={getEntry}
                                disabled={pending}
                            />
                            */}
                        </>
                    )}
                    <EntryControl
                        // FIXME: Remove cast after entry comments
                        // is switched to gql
                        entryId={+entry.id}
                        projectId={+projectId}
                        value={!!entry.controlled}
                        onChange={getEntry}
                        disabled={pending}
                    />
                </div>
            )}
        >
            <EntryListItem
                className={styles.entry}
                entry={entry}
                primaryTagging={framework?.primaryTagging}
                secondaryTagging={framework?.secondaryTagging}
                readOnly
            />
        </Container>
    );
}

export default EntryItem;
