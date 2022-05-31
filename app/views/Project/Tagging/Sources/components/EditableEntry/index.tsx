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
import { getOperationName } from 'apollo-link';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import {
    Container,
    Button,
    ConfirmButton,
    NumberOutput,
    useBooleanState,
    Spinner,
    useAlert,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';
import { IoTrash } from 'react-icons/io5';

import { PROJECT_SOURCES } from '#views/Project/Tagging/Sources/queries';
import ExcerptInput from '#components/entry/ExcerptInput';
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
import { getHiddenWidgetIds, Widget } from '#types/newAnalyticalFramework';
import { GeoArea } from '#components/GeoMultiSelectInput';
import routes from '#base/configs/routes';
import EntryInput from '#components/entry/EntryInput';
import EntryCommentWrapper from '#components/entryReview/EntryCommentWrapper';
import EntryControl from '#components/entryReview/EntryControl';
import EntryVerification from '#components/entryReview/EntryVerification';
import ProjectContext from '#base/context/ProjectContext';
import { DeepReplace } from '#utils/types';

import styles from './styles.css';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, Widget>;
type Section = NonNullable<Framework['primaryTagging']>[number];

const UPDATE_ENTRY = gql`
mutation UpdateEntry($projectId:ID!, $entryId:ID!, $entryData: EntryInputType!) {
    project(id: $projectId) {
        id
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
        id
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
    hideEntryId?: boolean;
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
    firstElementRef?: React.RefObject<HTMLDivElement>;
}

function EditableEntry(props: Props) {
    const {
        className,
        projectId,
        leadId,
        entryId,
        entry,
        hideEntryId,
        primaryTagging,
        secondaryTagging,
        compact,
        controlled,
        verifiedBy,
        entryImage,
        onEntryDataChange,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        firstElementRef,
    } = props;

    const history = useHistory();

    const allWidgets = useMemo(
        () => {
            const widgetsFromPrimary = primaryTagging?.flatMap(
                (item) => (item.widgets ?? []),
            ) ?? [];
            const widgetsFromSecondary = secondaryTagging ?? [];
            return [
                ...widgetsFromPrimary,
                ...widgetsFromSecondary,
            ];
        },
        [primaryTagging, secondaryTagging],
    );

    const schema = useMemo(
        () => {
            const widgetsMapping = listToMap(
                allWidgets,
                (item) => item.id,
                (item) => item,
            );
            return getEntrySchema(widgetsMapping);
        },
        [allWidgets],
    );

    const alert = useAlert();
    const { project } = useContext(ProjectContext);
    const [editMode, setEditModeTrue, setEditModeFalse] = useBooleanState(false);

    // TODO: handle pristine
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
            refetchQueries: [getOperationName(PROJECT_SOURCES)].filter(isDefined),
            onCompleted: (gqlResponse) => {
                const response = gqlResponse?.project?.entryUpdate;
                if (!response) {
                    return;
                }

                if (response.ok) {
                    alert.show(
                        'Successfully updated tags!',
                        { variant: 'success' },
                    );
                    // FIXME: update form data from server
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
            refetchQueries: [getOperationName(PROJECT_SOURCES)].filter(isDefined),
            onCompleted: (response) => {
                const {
                    ok,
                } = response.project.entryDelete;
                if (ok) {
                    alert.show(
                        'Successfully deleted entry.',
                        {
                            variant: 'success',
                        },
                    );
                    onEntryDataChange();
                } else {
                    alert.show(
                        'Failed to delete entry.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete entry.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleEntryChange = setValue;

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

    const handleEditCancel = useCallback(
        () => {
            setEditModeFalse();
            setValue(entry);
        },
        [entry, setEditModeFalse, setValue],
    );

    const handleSaveButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                // FIXME: this is repeated
                const hiddenWidgetIds = getHiddenWidgetIds(
                    allWidgets,
                    entry.attributes ?? [],
                );

                const transformedEntryData = {
                    ...entryData,
                    deleted: undefined,
                    stale: undefined,
                    attributes: entryData.attributes
                        ?.filter((attribute) => isDefined(attribute.data))
                        .filter((attribute) => !hiddenWidgetIds[attribute.widget])
                        .map((attribute) => ({
                            ...attribute,
                            widgetVersion: attribute.widgetVersion,
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
    }, [allWidgets, projectId, validate, setError, updateEntry, entry.id, entry.attributes]);

    const verifiedByIds = useMemo(() => (
        verifiedBy?.map((v) => v.id) ?? []
    ), [verifiedBy]);

    const handleAddButtonClick = useCallback((entryIdToAdd: string, sectionId?: string) => {
        const link = generatePath(routes.entryEdit.path, {
            projectId,
            leadId,
        });
        history.push(`${link}${sectionId ? '#/primary-tagging' : '#/secondary-tagging'}`, {
            entryId: entryIdToAdd,
            sectionId,
            activePage: sectionId ? 'primary' : 'secondary',
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
            emptyValueHidden={!editMode}
            variant={compact ? 'compact' : undefined}
            leadId={leadId}
            entryImage={entryImage}
            error={error}
            geoAreaOptions={geoAreaOptions}
            onGeoAreaOptionsChange={onGeoAreaOptionsChange}
            allWidgets={allWidgets}
            hideEntryId={hideEntryId}
        />
    );

    const entryControl = (
        <EntryControl
            entryId={entryId}
            projectId={projectId}
            value={!!controlled}
            onChange={onEntryDataChange}
        />
    );
    const entryVerification = (
        <EntryVerification
            entryId={entryId}
            projectId={projectId}
            verifiedBy={verifiedByIds}
            onVerificationChange={onEntryDataChange}
        />
    );

    const entryComments = (
        <EntryCommentWrapper
            entryId={entryId}
            projectId={projectId}
            modalLeftContent={(
                <ExcerptInput
                    value={value.excerpt}
                    image={entryImage}
                    imageRaw={undefined}
                    // FIXME: pass this after image drag/drop is implemented
                    leadImageUrl={undefined}
                    entryType={value.entryType}
                    readOnly
                />
            )}
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

    const entryIdDisplay = (
        <NumberOutput
            className={styles.entryId}
            prefix="#"
            value={Number(entryId)}
        />
    );

    if (compact) {
        return (
            <Container
                elementRef={firstElementRef}
                className={className}
                footerActions={canEditEntry && (
                    <>
                        {editMode ? saveButton : editTagsButton}
                        {entryComments}
                        {entryVerification}
                    </>
                )}
            >
                {entryInput}
            </Container>
        );
    }

    return (
        <Container
            elementRef={firstElementRef}
            className={className}
            headerIcons={(
                <>
                    {entryIdDisplay}
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
                        onClick={handleEditCancel}
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
