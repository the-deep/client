import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';
import {
    IoTrashBinOutline,
    IoAdd,
} from 'react-icons/io5';
import {
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
import { useRequest } from '#base/utils/restRequest';

import _ts from '#ts';
import {
    BasicRegion,
    Region,
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
    isExpanded: boolean;
    handleExpansion: (_: boolean, name: string) => void;
    activeAdminLevel: string | undefined;
    onActiveAdminLevelChange?: (value: string | undefined) => void;
    tempAdminLevel: PartialAdminLevel | undefined;
    onTempAdminLevelChange?: (value: PartialAdminLevel | undefined) => void;
    onAdminLevelUpdate?: () => void;
    navigationDisabled?: boolean;
}

function RegionCard(props: Props) {
    const {
        handleExpansion,
        isExpanded,
        className,
        region,
        activeAdminLevel,
        onActiveAdminLevelChange,
        tempAdminLevel,
        onTempAdminLevelChange,
        navigationDisabled,
        onAdminLevelUpdate,
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

    // FIXME: we don't even need this request when moving to gql
    const {
        response: regionResponse,
        pending: regionPending,
    } = useRequest<Region>({
        url: `server://regions/${region.id}/`,
        skip: !isExpanded,
        method: 'GET',
        failureHeader: _ts('geoAreas', 'title'),
    });

    const adminLevelQuery = useMemo(
        () => ({
            region: region.id,
        }),
        [region.id],
    );

    const {
        response: adminLevelsResponse,
        pending: adminLevelsPending,
    } = useRequest<MultiResponse<AdminLevelGeoArea>>({
        url: 'server://admin-levels/',
        skip: !isExpanded,
        query: adminLevelQuery,
        method: 'GET',
        onSuccess: (response) => {
            if (response.results.length <= 0) {
                return;
            }
            // NOTE: this will be fixed on graphql endpoint
            const adminLevelsWithClientId = response.results.map((al) => ({
                ...al,
                clientId: al.id.toString(),
            }));
            setAdminLevels(adminLevelsWithClientId);

            if (!activeAdminLevel && onActiveAdminLevelChange) {
                const [first] = adminLevelsWithClientId;
                onActiveAdminLevelChange(first.id.toString());
            }
        },
        failureHeader: 'Failed to fetch admin levels',
    });

    const handleDeleteRegionClick = useCallback(
        () => {
            // TODO: this will be added later
            // eslint-disable-next-line no-console
            console.warn('to be implemented');
        },
        [],
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
            }
            /*
            // TODO: actually delete admin level
            else {
                setAdminLevels((oldAdminLevels) => {
                    const newAdminLevels = [
                        ...oldAdminLevels,
                    ];
                    const index = newAdminLevels.findIndex(item => item.id === id);
                    if (index !== -1) {
                        newAdminLevels.splice(index);
                    }
                    return newAdminLevels;
                });
                if (onAdminLevelUpdate) {
                    onAdminLevelUpdate();
                }
            }
             */
        },
        [onTempAdminLevelChange],
    );

    const handlePublishGeoArea = useCallback(
        () => {
            // TODO add this later
            // eslint-disable-next-line no-console
            console.warn('to be implemented');
        },
        [],
    );

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
            isPublished: regionResponse?.isPublished,
            adminLevelOptions: adminLevels,
        }),
        [
            regionResponse?.isPublished,
            adminLevels,
            handleAdminLevelSave,
            handleAdminLevelDelete,
        ],
    );

    return (
        <ControlledExpandableContainer
            name={region.id.toString()}
            className={_cs(className, styles.region)}
            heading={region.title}
            alwaysMountedContent={false}
            expanded={isExpanded}
            withoutBorder
            disabled={navigationDisabled}
            onExpansionChange={handleExpansion}
            headerActions={(
                <QuickActionConfirmButton
                    name="deleteButton"
                    title={_ts('geoAreas', 'deleteGeoArea')}
                    onConfirm={handleDeleteRegionClick}
                    message={_ts('geoAreas', 'deleteGeoAreaConfirm')}
                    showConfirmationInitially={false}
                    disabled
                    // disabled={navigationDisabled}
                >
                    <IoTrashBinOutline />
                </QuickActionConfirmButton>
            )}
        >
            {regionResponse && adminLevelsResponse && !regionPending && !adminLevelsPending && (
                <ContainerCard
                    className={_cs(className, styles.addAdminLevel)}
                    heading="Custom Admin Levels"
                    headingSize="extraSmall"
                    contentClassName={styles.content}
                    headerActions={!regionResponse.isPublished && (
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
                    footerActions={!regionResponse.isPublished && (
                        <ConfirmButton
                            name="submit"
                            onClick={handlePublishGeoArea}
                            variant="secondary"
                            disabled
                            // disabled={navigationDisabled}
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
                        <List
                            data={adminLevelsWithTempAdminLevel}
                            keySelector={tabKeySelector}
                            rendererParams={tabPanelRendererParams}
                            renderer={AddAdminLevelPane}
                        />
                    </Tabs>
                </ContainerCard>
            )}
        </ControlledExpandableContainer>
    );
}

export default RegionCard;
