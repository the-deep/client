import React, { useCallback, useContext } from 'react';
import { useForm, createSubmitHandler } from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';

import {
    Container,
    Button,
    useBooleanState,
    Spinner,
    useAlert,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';

import {
    entrySchema,
    PartialEntryType as EntryInputType,
} from '#views/Project/EntryEdit/schema';
import { Entry } from '#views/Project/EntryEdit/types';
import {
    WidgetType as WidgetRaw,
    AnalysisFrameworkDetailType,
    UpdateEntryMutation,
    UpdateEntryMutationVariables,
} from '#generated/types';
import { Widget } from '#types/newAnalyticalFramework';
import EntryInput from '#components/entry/EntryInput';
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';
import { useLazyRequest } from '#base/utils/restRequest';
import ProjectContext from '#base/context/ProjectContext';
import { DeepReplace } from '#utils/types';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, WidgetRaw, Widget>;
type Section = NonNullable<Framework['primaryTagging']>[number];

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

interface Props {
    className?: string;
    entry: EntryInputType;
    projectId: string;
    leadId: string;
    entryId: string;
    primaryTagging: Section[] | undefined | null;
    secondaryTagging: Widget[] | undefined | null;
    controlled: boolean | undefined | null;
    compact?: boolean;
    entryImage: Entry['image'] | undefined | null;
}

function EditableEntry(props: Props) {
    const {
        className,
        projectId,
        leadId,
        entryId,
        entry,
        primaryTagging,
        secondaryTagging,
        compact,
        controlled,
        entryImage,
    } = props;

    const alert = useAlert();
    const { project } = useContext(ProjectContext);
    const [editMode, setEditModeTrue, setEditModeFalse] = useBooleanState(false);
    const {
        setValue,
        value,
        validate,
        setError,
    } = useForm(entrySchema, entry);

    const [
        updateEntry,
        { loading: updateEntryPending },
    ] = useMutation<UpdateEntryMutation, UpdateEntryMutationVariables>(
        UPDATE_ENTRY,
        {
            onCompleted: (gqlResponse) => {
                const response = gqlResponse?.project?.entryUpdate;

                if (response?.ok) {
                    alert.show(
                        'Tags updated successfully!',
                        { variant: 'success' },
                    );
                    setEditModeFalse();
                } else {
                    alert.show(
                        'Failed to update tags!',
                        { variant: 'error' },
                    );

                    // eslint-disable-next-line no-console
                    console.error(response?.errors);
                }
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

    const handleEntryChange = useCallback((v) => {
        setValue(v);
    }, [setValue]);

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

    const {
        pending,
        trigger: getEntry,
    } = useLazyRequest<unknown, number>({
        url: (ctx) => `server://v2/entries/${ctx}/`,
        method: 'GET',
        /*
        // FIXME: this will not work
        onSuccess: (response) => {
            setValue(response);
        },
        */
        failureHeader: 'Entry',
    });

    const handleSaveButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                const transformedEntryData = {
                    ...entryData,
                    deleted: undefined,
                    stale: undefined,
                    attributes: entryData.attributes?.map((attribute) => ({
                        ...attribute,
                        widgetType: undefined,
                    })),
                };
                if (entry.id) {
                    updateEntry({
                        variables: {
                            projectId,
                            entryId: entry.id,
                            entryData: transformedEntryData,
                        },
                    });
                } else {
                    // FIXME: handle error
                    // eslint-disable-next-line no-console
                    console.error('No entry id');
                }
            },
        );
        submit();
    }, [projectId, validate, setError, updateEntry, entry.id]);

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

    const entryInput = (
        <EntryInput
            name={undefined}
            value={value}
            onChange={handleEntryChange}
            primaryTagging={primaryTagging}
            secondaryTagging={secondaryTagging}
            readOnly={!editMode}
            compact={compact}
            leadId={leadId}
            entryImage={entryImage}
        />
    );

    const entryControl = (
        <EntryControl
            // FIXME: Remove cast after entry comments
            // is switched to gql
            entryId={+entryId}
            projectId={+projectId}
            value={!!controlled}
            onChange={getEntry}
            disabled={pending}
        />
    );
    const entryVerification = (
        null
        /*
           <EntryVerification
               className={styles.button}
               entryId={entryId}
               projectId={entry.project}
               verifiedBy={entry.verifiedBy}
               onVerificationChange={getEntry}
               disabled={pending}
           />
         */
    );

    const entryComments = (
        <EntryComments
            // FIXME: Remove cast after entry comments
            // is switched to gql
            entryId={+entryId}
            projectId={+projectId}
        />
    );

    const editTagsButton = (
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
    );

    if (compact) {
        return (
            <Container
                className={className}
                footerActions={(
                    <>
                        {canEditEntry && (
                            <>
                                {editMode ? saveButton : editTagsButton}
                                {entryComments}
                                {entryVerification}
                            </>
                        )}
                        {entryControl}
                    </>
                )}
            >
                {entryInput}
            </Container>
        );
    }

    return (
        <Container
            className={className}
            headerIcons={(
                <>
                    {canEditEntry && (
                        <>
                            {editTagsButton}
                            {entryComments}
                            {entryVerification}
                        </>
                    )}
                    {entryControl}
                </>
            )}
            headerActions={editMode && (
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
        >
            {entryInput}
        </Container>
    );
}

export default EditableEntry;
