import React, { useMemo, useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import {
    IoPencil,
    IoTrashBinOutline,
    IoClose,
} from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';
import {
    removeNull,
} from '@togglecorp/toggle-form';
import {
    DateOutput,
    TextOutput,
    Button,
    QuickActionLink,
    QuickActionConfirmButton,
    Container,
    useAlert,
} from '@the-deep/deep-ui';

import ExcerptInput from '#components/entry/ExcerptInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import ProjectContext from '#base/context/ProjectContext';
import { PartialEntryType as EntryInputType } from '#views/Project/EntryEdit/schema';
import routes from '#base/configs/routes';

import EditableEntry from '../../components/EditableEntry';
import { Framework, Entry } from '../types';

import styles from './styles.css';

const DELETE_ENTRY = gql`
mutation DeleteEntry($projectId:ID!, $entryId:ID!) {
    project(id: $projectId) {
        entryDelete(id: $entryId) {
            ok
            errors
        }
    }
}
`;

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
    leadDetails: Entry['lead'];
    projectId: string;
    framework: Framework | undefined | null;
    tagsVisible?: boolean;
    onViewTagsButtonClick?: (entryId: string) => void;
    onHideTagsButtonClick?: (entryId: string) => void;
    onEntryDataChange: () => void;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
}

function EntryCard(props: Props) {
    const {
        className,
        entry,
        leadDetails,
        framework,
        projectId,
        tagsVisible,
        onViewTagsButtonClick,
        onHideTagsButtonClick,
        onEntryDataChange,
        geoAreaOptions,
        onGeoAreaOptionsChange,
    } = props;

    const alert = useAlert();
    const { project } = useContext(ProjectContext);
    const authorsDetailText = useMemo(() => (
        leadDetails?.authors?.map((a) => a.title)?.join(', ')
    ), [leadDetails?.authors]);

    const [
        deleteEntry,
        { loading: deleteEntryPending },
    ] = useMutation(
        DELETE_ENTRY,
        {
            onCompleted: () => {
                alert.show(
                    'Successfully deleted entry.',
                    {
                        variant: 'success',
                    },
                );
                onEntryDataChange();
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );

    const editEntryLink = useMemo(() => ({
        pathname: generatePath(routes.entryEdit.path, {
            projectId,
            leadId: entry.lead.id,
        }),
        state: { entryId: entry.clientId },
        hash: '#/primary-tagging',
    }), [projectId, entry.lead.id, entry.clientId]);

    const handleEntryDeleteClick = useCallback(() => {
        deleteEntry({
            variables: {
                projectId,
                entryId: entry.id,
            },
        });
    }, [projectId, entry.id, deleteEntry]);

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

    return (
        <div
            className={_cs(
                styles.entryCard,
                className,
                tagsVisible && styles.expanded,
            )}
        >
            <Container
                className={styles.sourceDetails}
                heading={leadDetails.title}
                headingSize="small"
                headerDescription={(
                    <DateOutput
                        value={leadDetails.publishedOn}
                    />
                )}
                footerQuickActions={canEditEntry && (
                    <>
                        <QuickActionLink
                            to={editEntryLink}
                        >
                            <IoPencil />
                        </QuickActionLink>
                        <QuickActionConfirmButton
                            name={undefined}
                            onConfirm={handleEntryDeleteClick}
                            disabled={deleteEntryPending}
                            message="Are you sure you want to delete the entry?"
                        >
                            <IoTrashBinOutline />
                        </QuickActionConfirmButton>
                    </>
                )}
                footerActions={(
                    <Button
                        name={entry.id}
                        disabled={tagsVisible}
                        onClick={onViewTagsButtonClick}
                    >
                        View tags
                    </Button>
                )}
                contentClassName={styles.content}
            >
                <ExcerptInput
                    className={styles.excerpt}
                    entryType={entry.entryType}
                    value={entry.excerpt}
                    image={entry.image}
                    // NOTE: no need to pass imageRaw and leadImageUrl as they
                    // are not retrieved from server
                    imageRaw={undefined}
                    leadImageUrl={undefined}
                    // droppedExcerpt={entry.droppedExcerpt}
                    // tabularFieldData={entry.tabularFieldData}
                    readOnly
                />
                <div className={styles.metaSection}>
                    <TextOutput
                        label="Added on"
                        value={leadDetails.createdAt}
                        valueType="date"
                    />
                    <TextOutput
                        label="Publisher"
                        value={leadDetails.source?.title}
                    />
                    <TextOutput
                        label="Added by"
                        value={leadDetails.createdBy?.displayName}
                    />
                    {authorsDetailText && (
                        <TextOutput
                            label="Author"
                            value={authorsDetailText}
                        />
                    )}
                </div>
            </Container>
            {tagsVisible && (
                <>
                    <Button
                        className={styles.closeButton}
                        name={entry.id}
                        onClick={onHideTagsButtonClick}
                        variant="action"
                    >
                        <IoClose />
                    </Button>
                    <div className={styles.verticalSeparator} />
                    <EditableEntry
                        className={styles.entry}
                        // FIXME: memoize this
                        entry={transformEntry(entry)}
                        projectId={projectId}
                        leadId={entry.lead.id}
                        entryId={entry.id}
                        primaryTagging={framework?.primaryTagging}
                        secondaryTagging={framework?.secondaryTagging}
                        controlled={entry.controlled}
                        verifiedBy={entry.verifiedBy}
                        compact
                        entryImage={entry.image}
                        onEntryDataChange={onEntryDataChange}
                        geoAreaOptions={geoAreaOptions}
                        onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                    />
                </>
            )}
        </div>
    );
}

export default EntryCard;
