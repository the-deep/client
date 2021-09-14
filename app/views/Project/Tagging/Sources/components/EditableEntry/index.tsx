import React from 'react';
import {
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';

import {
    Container,
    Button,
    useBooleanState,
    Spinner,
    useAlert,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';

import { entrySchema } from '#views/Project/EntryEdit/schema';
import {
    Framework,
    Entry,
    EntryInput as EntryInputType,
} from '#views/Project/EntryEdit/types';
import EntryInput from '#components/entry/EntryInput';
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';
import { useLazyRequest } from '#base/utils/restRequest';
import ProjectContext from '#base/context/ProjectContext';

const UPDATE_ENTRY = gql`
mutation UpdateEntry($projectId:ID!, $entryId:ID!, $entryData: EntryInputType!) {
    project(id: $projectId) {
        entryUpdate(id: $entryId, data: $entryData) {
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
    projectId: string;
    framework: Framework | undefined | null;
    compact?: boolean;
}

function EditableEntry(props: Props) {
    const {
        className,
        projectId,
        entry,
        framework,
        compact,
    } = props;

    const alert = useAlert();
    const { project } = React.useContext(ProjectContext);
    const [editMode, setEditModeTrue, setEditModeFalse] = useBooleanState(false);
    const {
        setValue,
        value,
        validate,
    } = useForm(entrySchema, entry);

    const [updateEntry, { loading: updateEntryPending }] = useMutation(
        UPDATE_ENTRY,
        {
            onCompleted: () => {
                alert.show(
                    'Tags updated successfully!',
                    { variant: 'success' },
                );
            },
            onError: (gqlError) => {
                alert.show(
                    'Failed to update tags!',
                    { variant: 'error' },
                );

                // eslint-disable-next-line no-console
                console.error(gqlError);
            },
        },
    );

    const handleEntryChange = React.useCallback((v) => {
        setValue(v);
    }, [setValue]);

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

    const {
        pending,
        trigger: getEntry,
    } = useLazyRequest<Entry, number>({
        url: (ctx) => `server://v2/entries/${ctx}/`,
        method: 'GET',
        onSuccess: (response) => {
            setValue(response);
        },
        failureHeader: 'Entry',
    });

    const handleSaveButtonClick = React.useCallback(() => {
        const {
            value: entryData,
        } = validate();

        updateEntry({
            variables: {
                projectId,
                entryId: entry.id,
                entryData,
            },
        });
    }, [projectId, validate, updateEntry, entry.id]);

    const saveButton = (
        <Button
            name={undefined}
            onClick={handleSaveButtonClick}
            variant="primary"
            disabled={updateEntryPending}
            icons={updateEntryPending && (
                <Spinner inheritColor />
            )}
        >
            Save
        </Button>
    );

    const extraActions = (
        <>
            {canEditEntry && (
                <>
                    {(!compact || !editMode) && (
                        <Button
                            name={undefined}
                            variant="secondary"
                            icons={(
                                <FiEdit2 />
                            )}
                            onClick={setEditModeTrue}
                            disabled={editMode}
                        >
                            Edit Tags
                        </Button>
                    )}
                    {compact && editMode && saveButton}
                    <EntryComments
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
        </>
    );
    return (
        <Container
            className={className}
            headerIcons={!compact && extraActions}
            headerActions={!compact && editMode && (
                <>
                    {saveButton}
                    <Button
                        name={undefined}
                        onClick={setEditModeFalse}
                        variant="secondary"
                        disabled={updateEntryPending}
                    >
                        Cancel
                    </Button>
                </>
            )}
            footerActions={compact && extraActions}
        >
            <EntryInput
                name={undefined}
                value={transformEntry(value)}
                onChange={handleEntryChange}
                primaryTagging={framework?.primaryTagging}
                secondaryTagging={framework?.secondaryTagging}
                readOnly={!editMode}
                compact={compact}
                leadId={entry.lead.id}
            />
        </Container>
    );
}

export default EditableEntry;
