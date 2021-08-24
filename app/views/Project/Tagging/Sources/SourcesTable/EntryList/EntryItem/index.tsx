import React, { useState, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
    ButtonLikeLink,
    Container,
} from '@the-deep/deep-ui';
import { FaRegCommentAlt } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import { useLazyRequest } from '#base/utils/restRequest';
import { Entry } from '#types/newEntry';
import ProjectContext from '#base/context/ProjectContext';
import useRouteMatching from '#base/hooks/useRouteMatching';
import routes from '#base/configs/routes';
import EntryListItem from '#components/EntryListItem';
import frameworkMockData from '#views/AnalyticalFramework/mockData';
import { entry1 } from '#views/Project/Tagging/mockData';
import EntryVerification from './EntryVerification';
import EntryControl from './EntryControl';
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
        routes.taggingFlow,
        {
            projectId,
            leadId,
        },
    );

    const taggingFlowLink = route?.to ?? '';

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handleClick = () => {}; // TODO: implement later

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
                                to={taggingFlowLink}
                                icons={(
                                    <FiEdit2 />
                                )}
                            >
                                Edit Tags
                            </ButtonLikeLink>
                            <QuickActionButton
                                className={styles.button}
                                variant="secondary"
                                name="showComments"
                                disabled
                                onClick={handleClick}
                            >
                                <FaRegCommentAlt />
                            </QuickActionButton>
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
                entry={entry1} // TODO remove mock entry usage when actual usable entry is available
                framework={frameworkMockData}
                readOnly
            />
        </Container>
    );
}

export default EntryItem;
