import React, { useState, useContext, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ButtonLikeLink,
    Container,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';
import {
    removeNull,
} from '@togglecorp/toggle-form';

import { useLazyRequest } from '#base/utils/restRequest';
import ProjectContext from '#base/context/ProjectContext';
import useRouteMatching from '#base/hooks/useRouteMatching';
import routes from '#base/configs/routes';
import {
    Framework,
    Entry,
} from '../../types';

import EntryInput from '#components/entry/EntryInput';
/*
import EntryVerification from '#components/entryReview/EntryVerification';
 */
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';
import { EntryInput as EntryInputType } from '#views/Project/EntryEdit/types';

import styles from './styles.css';

function transformEntry(entry: Entry): EntryInputType {
    return removeNull({
        ...entry,
        lead: entry.lead.id,
        image: entry.image?.id,
        attributes: entry.attributes?.map((attribute) => ({
            ...attribute,
            // NOTE: we don't need this on form
            geoSelectedOptions: undefined,
        })),
    });
}

interface Props {
    className?: string;
    entry: Entry;
    projectId: string;
    leadId: string;
    framework: Framework | undefined | null;
}

function EntryItem(props: Props) {
    const {
        className,
        projectId,
        leadId,
        entry: entryFromProps,
        framework,
    } = props;

    const { project } = useContext(ProjectContext);
    const [entry, setEntry] = useState<Entry>(entryFromProps);

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

    const handleChange = useCallback(
        (value: unknown) => {
            // FIXME: handle here
            // eslint-disable-next-line no-console
            console.warn('Should set value to', value);
        },
        [],
    );

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
            <EntryInput
                name={undefined}
                value={transformEntry(entry)}
                onChange={handleChange}
                className={styles.entry}
                primaryTagging={framework?.primaryTagging}
                secondaryTagging={framework?.secondaryTagging}
                leadId={entry.lead.id}
                readOnly
            />
        </Container>
    );
}

export default EntryItem;
