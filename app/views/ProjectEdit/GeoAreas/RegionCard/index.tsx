import React,
{
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    _cs,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    PartialForm,
    internal,
    removeNull,
} from '@togglecorp/toggle-form';
import {
    IoTrashBinOutline,
    IoInformationCircleOutline,
    IoAdd,
} from 'react-icons/io5';
import {
    gql,
    useMutation,
    useQuery,
} from '@apollo/client';
import {
    ListView,
    Message,
    ControlledExpandableContainer,
    QuickActionConfirmButton,
    ContainerCard,
    Button,
    ConfirmButton,
    Tabs,
    TabList,
    Tab,
    List,
    useAlert,
} from '@the-deep/deep-ui';
import {
    RegionsForGeoAreasQuery,
    PublishRegionMutation,
    PublishRegionMutationVariables,
    AdminLevelType,
    AdminLevelsQuery,
    AdminLevelsQueryVariables,
    DeleteRegionMutation,
    DeleteRegionMutationVariables,
    DeleteAdminLevelMutation,
    DeleteAdminLevelMutationVariables,
} from '#generated/types';
import {
    ObjectError,
    transformToFormError,
} from '#base/utils/errorTransform';

import AddAdminLevelPane from './AddAdminLevelPane';

import styles from './styles.css';

type AdminLevelWithClientIdType = AdminLevelType & { clientId: string };
type PartialAdminLevel = PartialForm<AdminLevelWithClientIdType>;

const tabKeySelector = (d: AdminLevelWithClientIdType) => d.clientId;

type Region = NonNullable<NonNullable<NonNullable<RegionsForGeoAreasQuery['project']>['regions']>[number]>;

const PUBLISH_REGION = gql`
    mutation PublishRegion($regionId: ID!) {
        publishRegion(id: $regionId) {
            ok
            errors
        }
    }
`;

const DELETE_REGION = gql`
    mutation DeleteRegion($projectId: ID!, $regionId: [ID!]) {
        project(id: $projectId) {
            projectRegionBulk(regionsToRemove: $regionId) {
                errors
                deletedResult {
                    id
                }
            }
        }
    }
`;

const ADMIN_LEVELS = gql`
    query AdminLevels($regionId: ID!) {
        region(id: $regionId) {
            adminLevels {
                tolerance
                title
                staleGeoAreas
                parentNameProp
                parentCodeProp
                codeProp
                nameProp
                geoShapeFile {
                    file {
                        url
                    }
                    id
                    title
                    mimeType
                }
                level
                id
            }
        }
    }
`;

const DELETE_ADMIN_LEVEL = gql`
    mutation DeleteAdminLevel($adminLevelId: ID!) {
        deleteAdminLevel(adminLevelId: $adminLevelId) {
            errors
            ok
        }
    }
`;

interface Props {
    region: Region;
    className?: string;
    activeProject: string;
    isExpanded: boolean;
    handleExpansion: (_: boolean, name: string) => void;
    activeAdminLevel: string | undefined;
    onActiveAdminLevelChange?: (value: string | undefined) => void;
    tempAdminLevel: PartialAdminLevel | undefined;
    onTempAdminLevelChange?: (value: PartialAdminLevel | undefined) => void;
    onAdminLevelUpdate?: () => void;
    navigationDisabled?: boolean;
    isPublished: boolean;
    onRegionPublishSuccess: () => void;
    onRegionRemoveSuccess: () => void;
}

function RegionCard(props: Props) {
    const {
        handleExpansion,
        isExpanded,
        isPublished,
        className,
        region,
        activeAdminLevel,
        onActiveAdminLevelChange,
        activeProject,
        tempAdminLevel,
        onTempAdminLevelChange,
        navigationDisabled,
        onAdminLevelUpdate,
        onRegionPublishSuccess,
        onRegionRemoveSuccess,
    } = props;

    // setting this so that when user add an admin level, it is updated
    // NOTE: can be removed after using apollo client
    const [
        adminLevels,
        setAdminLevels,
    ] = useState<AdminLevelWithClientIdType[]>([]);
    const alert = useAlert();

    const adminLevelsLength = adminLevels.length;

    const adminLevelsWithTempAdminLevel: PartialAdminLevel[] = useMemo(
        () => {
            if (isNotDefined(tempAdminLevel)) {
                return adminLevels;
            }

            return [
                ...adminLevels,
                tempAdminLevel,
            ];
        },
        [adminLevels, tempAdminLevel],
    );

    const activeAdminLevelWithTempAdminLevel = tempAdminLevel
        ? tempAdminLevel.clientId
        : activeAdminLevel;

    const adminLevelQueryVariables = useMemo(
        () => ({
            regionId: region.id,
        }),
        [region.id],
    );

    const {
        loading: adminLevelsPending,
        refetch: refetchAdminLevels,
    } = useQuery<AdminLevelsQuery, AdminLevelsQueryVariables>(
        ADMIN_LEVELS,
        {
            skip: !isExpanded,
            variables: adminLevelQueryVariables,
            // NOTE: this prop is required for onCompleted to be
            // called after refetch (https://github.com/apollographql/apollo-client/issues/11151#issuecomment-1680742854)
            notifyOnNetworkStatusChange: true,
            onCompleted: (response) => {
                const adminLevelResponse = response.region;

                if (!adminLevelResponse || !adminLevelResponse.adminLevels) {
                    return;
                }
                // NOTE: this will be fixed on graphql endpoint
                const adminLevelsWithClientId = adminLevelResponse.adminLevels.map((al) => ({
                    ...al,
                    clientId: al.id.toString(),
                }));

                setAdminLevels(adminLevelsWithClientId);
                if (onActiveAdminLevelChange) {
                    const [first] = adminLevelsWithClientId;
                    if (first) {
                        onActiveAdminLevelChange(first.id);
                    }
                }
            },
        },
    );

    const [
        deleteAdminLevel,
        {
            loading: deleteAdminLevelPending,
        },
    ] = useMutation<DeleteAdminLevelMutation, DeleteAdminLevelMutationVariables>(
        DELETE_ADMIN_LEVEL,
        {
            onCompleted: (response) => {
                if (!response.deleteAdminLevel) {
                    return;
                }

                const { ok, errors } = response.deleteAdminLevel;

                if (errors) {
                    const formError = transformToFormError(
                        removeNull(response.deleteAdminLevel.errors) as ObjectError[],
                    );
                    alert.show(
                        formError?.[internal] as string,
                        { variant: 'error' },
                    );
                }

                if (ok) {
                    refetchAdminLevels();

                    if (onAdminLevelUpdate) {
                        onAdminLevelUpdate();
                    }
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete selected admin level.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        deleteRegion,
        {
            loading: pendingDeleteRegion,
        },
    ] = useMutation<DeleteRegionMutation, DeleteRegionMutationVariables>(
        DELETE_REGION,
        {
            onCompleted: (response) => {
                if (!response.project?.projectRegionBulk) {
                    return;
                }

                const {
                    deletedResult,
                    errors,
                } = response.project.projectRegionBulk;

                if (errors) {
                    alert.show(
                        'Failed to delete selected region.',
                        { variant: 'error' },
                    );
                }

                const ok = deletedResult?.some((result) => result.id === region.id);

                if (ok) {
                    alert.show(
                        'Region is successfully deleted!',
                        { variant: 'success' },
                    );
                    onRegionRemoveSuccess();
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete selected region.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleDeleteRegionClick = useCallback(
        () => {
            if (region.id) {
                deleteRegion({
                    variables: {
                        projectId: activeProject,
                        regionId: [region.id],
                    },
                });
            }
        },
        [deleteRegion, region, activeProject],
    );

    const handleAdminLevelAdd = useCallback(
        () => {
            if (!onTempAdminLevelChange) {
                return;
            }

            const clientId = randomString();
            const newAdminLevel: PartialAdminLevel = {
                clientId,
                title: `Admin Level ${adminLevelsLength}`,
                level: adminLevelsLength,
            };
            onTempAdminLevelChange(newAdminLevel);
        },
        [adminLevelsLength, onTempAdminLevelChange],
    );

    const handleAdminLevelSave = useCallback(
        (value: AdminLevelType) => {
            if (onTempAdminLevelChange) {
                onTempAdminLevelChange(undefined);
            }

            setAdminLevels((oldAdminLevels) => {
                const newAdminLevels = [...oldAdminLevels];
                const index = newAdminLevels.findIndex((item) => item.id === value.id);
                const valueWithClientId = {
                    ...value,
                    clientId: value.id.toString(),
                };
                if (index === -1) {
                    newAdminLevels.push(valueWithClientId);
                } else {
                    newAdminLevels.splice(index, 1, valueWithClientId);
                }
                return newAdminLevels;
            });

            if (onActiveAdminLevelChange) {
                onActiveAdminLevelChange(value.id);
            }

            if (onAdminLevelUpdate) {
                onAdminLevelUpdate();
            }
        },
        [onActiveAdminLevelChange, onTempAdminLevelChange, onAdminLevelUpdate],
    );

    const handleAdminLevelDelete = useCallback(
        (id: string | undefined) => {
            if (!id) {
                if (onTempAdminLevelChange) {
                    onTempAdminLevelChange(undefined);
                }
            } else {
                deleteAdminLevel({
                    variables: {
                        adminLevelId: id,
                    },
                });
            }
        },
        [onTempAdminLevelChange, deleteAdminLevel],
    );

    const [
        publishRegion,
        {
            loading: pendingPublishRegion,
        },
    ] = useMutation<PublishRegionMutation, PublishRegionMutationVariables>(
        PUBLISH_REGION,
        {
            onCompleted: (response) => {
                if (!response || !response.publishRegion) {
                    return;
                }

                const {
                    ok,
                    errors,
                } = response.publishRegion;

                if (errors) {
                    alert.show(
                        'Failed to publish selected region.',
                        { variant: 'error' },
                    );
                }

                if (ok) {
                    alert.show(
                        'Region is successfully published!',
                        { variant: 'success' },
                    );
                    onRegionPublishSuccess();
                }
            },
            onError: () => {
                alert.show(
                    'Failed to publish selected region.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handlePublishRegionClick = useCallback(() => {
        publishRegion({
            variables: {
                regionId: region.id,
            },
        });
    }, [publishRegion, region.id]);

    const tabListRendererParams = useCallback(
        (key: string, data: PartialAdminLevel) => ({
            name: key,
            children: data.title,
            transparentBorder: true,
        }),
        [],
    );

    const tabPanelRendererParams = useCallback(
        (key: string, data: PartialAdminLevel) => ({
            name: key,
            value: data,
            onSave: handleAdminLevelSave,
            onDelete: handleAdminLevelDelete,
            isPublished,
            adminLevelOptions: adminLevels,
            regionId: region.id,
        }),
        [
            region.id,
            isPublished,
            adminLevels,
            handleAdminLevelSave,
            handleAdminLevelDelete,
        ],
    );

    const pending = adminLevelsPending
        || pendingPublishRegion
        || deleteAdminLevelPending
        || pendingDeleteRegion;

    return (
        <ControlledExpandableContainer
            name={region.id.toString()}
            className={_cs(className, styles.region)}
            headingClassName={styles.heading}
            heading={(
                <>
                    {region.title}
                    {!isPublished && (
                        <span className={styles.headingDescription}>
                            (In progress)
                        </span>
                    )}
                </>
            )}
            alwaysMountedContent={false}
            expanded={isExpanded}
            withoutBorder
            disabled={navigationDisabled}
            onExpansionChange={handleExpansion}
            expansionTriggerArea="arrow"
            headerActions={(
                <QuickActionConfirmButton
                    name="deleteButton"
                    title="Remove geo area from this project"
                    onConfirm={handleDeleteRegionClick}
                    message="Removing the geo area will remove all the tagged geo data under your project.
                    The removal of tags cannot be undone.
                    Are you sure you want to remove this geo area from the project?"
                    showConfirmationInitially={false}
                    disabled={navigationDisabled}
                >
                    <IoTrashBinOutline />
                </QuickActionConfirmButton>
            )}
        >
            {!isPublished && (
                <Message
                    icon={(<IoInformationCircleOutline />)}
                    message="This geo area has not been published yet.
                    You won't see this geo area in your project while tagging."
                    className={styles.message}
                    compact
                />
            )}
            <ContainerCard
                className={_cs(className, styles.addAdminLevel)}
                heading="Custom Admin Levels"
                headingSize="extraSmall"
                contentClassName={styles.content}
                headerActions={!isPublished && (
                    <Button
                        name="addAdminLevel"
                        className={styles.submit}
                        onClick={handleAdminLevelAdd}
                        variant="tertiary"
                        icons={<IoAdd />}
                        disabled={navigationDisabled}
                    >
                        Add Admin Level
                    </Button>
                )}
                footerActions={!isPublished && (
                    <ConfirmButton
                        name={undefined}
                        onConfirm={handlePublishRegionClick}
                        message="Are you sure you want to publish this geo area?
                        After you publish the geo area you cannot make any changes to the admin levels."
                        disabled={(
                            navigationDisabled
                            || pendingPublishRegion
                            || adminLevels.length < 1
                        )}
                    >
                        Publish Area
                    </ConfirmButton>
                )}
            >
                <Tabs
                    onChange={onActiveAdminLevelChange}
                    value={activeAdminLevelWithTempAdminLevel}
                    disabled={navigationDisabled}
                >
                    <TabList className={styles.tabs}>
                        <List
                            data={adminLevelsWithTempAdminLevel}
                            keySelector={tabKeySelector}
                            rendererParams={tabListRendererParams}
                            renderer={Tab}
                        />
                    </TabList>
                    <ListView
                        data={adminLevelsWithTempAdminLevel}
                        keySelector={tabKeySelector}
                        errored={false}
                        rendererParams={tabPanelRendererParams}
                        pending={pending}
                        filtered={false}
                        messageShown
                        messageIconShown
                        emptyMessage="There are no admin levels in this region."
                        renderer={AddAdminLevelPane}
                    />
                </Tabs>
            </ContainerCard>
        </ControlledExpandableContainer>
    );
}

export default RegionCard;
