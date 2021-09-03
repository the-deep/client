import React, { useState, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ButtonLikeLink,
    Container,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';

import { useLazyRequest } from '#base/utils/restRequest';
import { Entry } from '#types/newEntry';
import ProjectContext from '#base/context/ProjectContext';
import useRouteMatching from '#base/hooks/useRouteMatching';
import routes from '#base/configs/routes';
import frameworkMockData from '#views/AnalyticalFramework/mockData';
import { entry1 } from '#views/Project/Tagging/mockData';

import EntryListItem from '#components/EntryListItem';
import EntryComments from '#components/EntryComments';
import EntryVerification from '#components/EntryVerification';
import EntryControl from '#components/EntryControl';

import styles from './styles.css';

interface Props {
    className?: string;
    entry: Entry;
    projectId: number;
    leadId: number;
}

function EntryItem(props: Props) {
    const {
        className,
        projectId,
        leadId,
        entry: entryFromProps,
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
                                entryId={entry.id}
                                projectId={projectId}
                            />
                            <EntryVerification
                                className={styles.button}
                                entryId={entry.id}
                                projectId={entry.project}
                                verifiedBy={entry.verifiedBy}
                                onVerificationChange={getEntry}
                                disabled={pending}
                            />
                        </>
                    )}
                    <EntryControl
                        entryId={entry.id}
                        projectId={entry.project}
                        value={entry.controlled}
                        onChange={getEntry}
                        disabled={pending}
                    />
                </div>
            )}
        >
            <EntryListItem
                className={styles.entry}
                entry={entry1} // TODO remove mock entry usage appropriate
                framework={frameworkMockData}
                readOnly
            />
        </Container>
    );
}

export default EntryItem;