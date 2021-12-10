import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';
import {
    IoTrashBinOutline,
    IoInformationCircleOutline,
    IoAdd,
} from 'react-icons/io5';
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
} from '@the-deep/deep-ui';
import {
    useRequest,
    useLazyRequest,
} from '#base/utils/restRequest';

import {
    BasicRegion,
    MultiResponse,
    AdminLevelGeoArea,
} from '#types';

import AddAdminLevelPane from './AddAdminLevelPane';

import styles from './styles.css';

type AdminLevel = AdminLevelGeoArea & { clientId: string };
type PartialAdminLevel = PartialForm<AdminLevel, 'clientId' | 'geoShapeFileDetails'>;

// NOTE: clientId is only used to show active tab
const tabKeySelector = (d: AdminLevel) => d.clientId;

interface Props {
    region: BasicRegion;
    className?: string;
    regions?: BasicRegion[];
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
        regions,
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
    ] = useState<AdminLevel[]>([]);

    const adminLevelsLength = adminLevels.length;

    const adminLevelsWithTempAdminLevel = useMemo(
        () => {
            if (!tempAdminLevel) {
                return adminLevels;
            }
            return [...adminLevels, tempAdminLevel];
        },
        [adminLevels, tempAdminLevel],
    );

    const activeAdminLevelWithTempAdminLevel = tempAdminLevel
        ? tempAdminLevel.clientId
        : activeAdminLevel;

    const adminLevelQuery = useMemo(
        () => ({
            region: region.id,
        }),
        [region.id],
    );

    const {
        pending: adminLevelsPending,
        retrigger: getAdminLevels,
    } = useRequest<MultiResponse<AdminLevelGeoArea>>({
        url: 'server://admin-levels/',
        skip: !isExpanded,
        query: adminLevelQuery,
        method: 'GET',
        onSuccess: (response) => {
            if (response.results.length < 0) {
                return;
            }
            // NOTE: this will be fixed on graphql endpoint
            const adminLevelsWithClientId = response.results.map((al) => ({
                ...al,
                clientId: al.id.toString(),
            }));
            setAdminLevels(adminLevelsWithClientId);

            if (onActiveAdminLevelChange) {
                const [first] = adminLevelsWithClientId;
                if (first) {
                    onActiveAdminLevelChange(first.id.toString());
                }
            }
        },
    });

    const {
        trigger: deleteAdminLevel,
    } = useLazyRequest<unknown, number>({
        url: (ctx) => `server://admin-levels/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            getAdminLevels();
            if (onAdminLevelUpdate) {
                onAdminLevelUpdate();
            }
        },
    });

    const {
        trigger: removeRegion,
    } = useLazyRequest<unknown, unknown>({
        url: `server://projects/${activeProject}/`,
        method: 'PATCH',
        body: () => ({
            regions: regions
                ?.filter((r) => r.id !== region.id)
                ?.map((r) => ({
                    id: r.id,
                })),
        }),
        onSuccess: () => {
            onRegionRemoveSuccess();
        },
    });

    const handleDeleteRegionClick = useCallback(
        () => {
            if (regions) {
                removeRegion(null);
            }
        },
        [removeRegion, regions],
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
                region: region.id,
            };
            onTempAdminLevelChange(newAdminLevel);
        },
        [region.id, adminLevelsLength, onTempAdminLevelChange],
    );

    const handleAdminLevelSave = useCallback(
        (value: AdminLevelGeoArea) => {
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
                onActiveAdminLevelChange(value.id.toString());
            }

            if (onAdminLevelUpdate) {
                onAdminLevelUpdate();
            }
        },
        [onActiveAdminLevelChange, onTempAdminLevelChange, onAdminLevelUpdate],
    );

    const handleAdminLevelDelete = useCallback(
        (id: number | undefined) => {
            if (!id) {
                if (onTempAdminLevelChange) {
                    onTempAdminLevelChange(undefined);
                }
            } else {
                deleteAdminLevel(id);
            }
        },
        [onTempAdminLevelChange, deleteAdminLevel],
    );

    const {
        pending: pendingPublishRegion,
        trigger: publishRegion,
    } = useLazyRequest<unknown>({
        url: `server://regions/${region.id}/publish/`,
        body: {},
        method: 'POST',
        onSuccess: () => {
            onRegionPublishSuccess();
        },
        failureMessage: 'Failed to publish selected region.',
    });

    const handlePublishRegionClick = useCallback(() => {
        publishRegion(null);
    }, [publishRegion]);

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
        }),
        [
            isPublished,
            adminLevels,
            handleAdminLevelSave,
            handleAdminLevelDelete,
        ],
    );

    const pending = adminLevelsPending || pendingPublishRegion;

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
