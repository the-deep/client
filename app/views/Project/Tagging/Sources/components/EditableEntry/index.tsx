import React, { useMemo, useCallback, useContext } from 'react';
import {
    useForm,
    createSubmitHandler,
    removeNull,
} from '@togglecorp/toggle-form';
import {
    useHistory,
    generatePath,
} from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import {
    Container,
    Button,
    ConfirmButton,
    useBooleanState,
    Spinner,
    useAlert,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';
import { IoTrash } from 'react-icons/io5';

import {
    getEntrySchema,
    PartialEntryType as EntryInputType,
} from '#views/Project/EntryEdit/schema';
import { Entry } from '#views/Project/EntryEdit/types';
import {
    WidgetType as WidgetRaw,
    AnalysisFrameworkDetailType,
    UpdateEntryMutation,
    UpdateEntryMutationVariables,
} from '#generated/types';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import { Widget } from '#types/newAnalyticalFramework';
import { GeoArea } from '#components/GeoMultiSelectInput';
import routes from '#base/configs/routes';
import EntryInput from '#components/entry/EntryInput';
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';
import EntryVerification from '#components/entryReview/EntryVerification';
import ProjectContext from '#base/context/ProjectContext';
import { DeepReplace } from '#utils/types';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, Widget>;
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

interface Props {
    className?: string;
    entry: EntryInputType;
    projectId: string;
    leadId: string;
    entryId: string;
    primaryTagging: Section[] | undefined | null;
    secondaryTagging: Widget[] | undefined | null;
    controlled: boolean | undefined | null;
    verifiedBy: {
        id: string;
    }[] | undefined | null;
    compact?: boolean;
    entryImage: Entry['image'] | undefined | null;
    onEntryDataChange: () => void;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
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
        verifiedBy,
        entryImage,
        onEntryDataChange,
        geoAreaOptions,
        onGeoAreaOptionsChange,
    } = props;

    const history = useHistory();

    // FIXME: memoize this
    const widgetsMapping = listToMap(
        [
            ...(primaryTagging?.flatMap((item) => (item.widgets ?? [])) ?? []),
            ...(secondaryTagging ?? []),
        ],
        (item) => item.id,
        (item) => item,
    );
    const schema = getEntrySchema(widgetsMapping);

    const alert = useAlert();
    const { project } = useContext(ProjectContext);
    const [editMode, setEditModeTrue, setEditModeFalse] = useBooleanState(false);
    const {
        setValue,
        value,
        validate,
        setError,
        error,
    } = useForm(schema, entry);

    const [
        updateEntry,
        { loading: updateEntryPending },
    ] = useMutation<UpdateEntryMutation, UpdateEntryMutationVariables>(
        UPDATE_ENTRY,
        {
            onCompleted: (gqlResponse) => {
                const response = gqlResponse?.project?.entryUpdate;
                if (!response) {
                    return;
                }

                if (response.ok) {
                    alert.show(
                        'Tags updated successfully!',
                        { variant: 'success' },
                    );
                    setEditModeFalse();
                } else {
                    const formError = transformToFormError(
                        removeNull(response.errors) as ObjectError[],
                    );
                    setError(formError);

                    alert.show(
                        'Failed to update tags!',
                        { variant: 'error' },
                    );
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

    const handleEntryChange = useCallback((v) => {
        setValue(v);
    }, [setValue]);

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

    const handleSaveButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                const transformedEntryData = {
                    ...entryData,
                    deleted: undefined,
                    stale: undefined,
                    attributes: entryData.attributes
                        ?.filter((attribute) => isDefined(attribute.data))
                        .map((attribute) => ({
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

    const verifiedByIds = useMemo(() => (
        verifiedBy?.map((v) => +v.id) ?? []
    ), [verifiedBy]);

    const handleAddButtonClick = useCallback((entryIdToAdd: string, sectionId?: string) => {
        const link = generatePath(routes.entryEdit.path, {
            projectId,
            leadId,
        });
        history.push(`${link}${sectionId ? '#/primary-tagging' : '#/secondary-tagging'}`, {
            entryId: entryIdToAdd,
            sectionId,
        });
    }, [projectId, leadId, history]);

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
            onAddButtonClick={handleAddButtonClick}
            primaryTagging={primaryTagging}
            secondaryTagging={secondaryTagging}
            readOnly={!editMode}
            compact={compact}
            leadId={leadId}
            entryImage={entryImage}
            error={error}
            geoAreaOptions={geoAreaOptions}
            onGeoAreaOptionsChange={onGeoAreaOptionsChange}
        />
    );

    const entryControl = (
        <EntryControl
            // FIXME: Remove cast after entry comments
            // is switched to gql
            entryId={+entryId}
            projectId={projectId}
            value={!!controlled}
            onChange={onEntryDataChange}
        />
    );
    const entryVerification = (
        <EntryVerification
            // FIXME: Remove cast after entry comments
            // is switched to gql
            entryId={+entryId}
            projectId={projectId}
            verifiedBy={verifiedByIds}
            onVerificationChange={onEntryDataChange}
        />
    );

    const entryComments = (
        <EntryComments
            // FIXME: Remove cast after entry comments
            // is switched to gql
            entryId={+entryId}
            projectId={projectId}
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

    const handleEntryDeleteButtonClick = useCallback(() => {
        deleteEntry({
            variables: {
                projectId,
                entryId: entry.id,
            },
        });
    }, [projectId, entry.id, deleteEntry]);

    const entryDeleteButton = (
        <ConfirmButton
            name={undefined}
            variant="secondary"
            onConfirm={handleEntryDeleteButtonClick}
            message="Are you sure you want to delete the entry?"
            disabled={deleteEntryPending || editMode}
            icons={(
                <IoTrash />
            )}
        >
            Delete Entry
        </ConfirmButton>

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
                    {canEditEntry && entryDeleteButton}
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
