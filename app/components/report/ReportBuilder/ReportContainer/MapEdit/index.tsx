import React, {
    useMemo,
    useCallback,
    useState,
} from 'react';
import {
    _cs,
    randomString,
    isDefined,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ExpandableContainer,
    Button,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    type SetValueArg,
    type Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import SortableList from '#components/SortableList';
import { reorder } from '#utils/common';
import {
    ReportMapEnumsQuery,
} from '#generated/types';

import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import MapLayerEdit from './MapLayerEdit';
import MapLayerItem from './MapLayerItem';
import {
    type ContentDataType,
    type MapConfigType,
    type MapLayerType,
} from '../../../schema';

import styles from './styles.css';

const MAP_ENUMS = gql`
    query ReportMapEnums {
        enums {
            AnalysisReportMapLayerConfigurationSerializerType {
                description
                enum
                label
            }
        }
    }
`;

type LayerType = NonNullable<MapConfigType['layers']>[number];
const layerKeySelector = (l: LayerType) => l.clientId;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: MapConfigType | undefined;
    onChange: (value: SetValueArg<MapConfigType | undefined>, name: NAME) => void;
    error?: Error<MapConfigType>;
    disabled?: boolean;
    contentData: ContentDataType[] | undefined;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
    onContentDataChange: (newContentData: SetValueArg<ContentDataType[] | undefined>) => void;
}

function MapEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        name,
        onChange,
        error: riskyError,
        disabled,
        geoDataUploads,
        onGeoDataUploadsChange,
        contentData,
        onContentDataChange,
    } = props;

    const {
        data: enumsData,
    } = useQuery<ReportMapEnumsQuery>(
        MAP_ENUMS,
    );

    const mapLayerTypeOptions = enumsData?.enums?.AnalysisReportMapLayerConfigurationSerializerType;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, MapConfigType
    >(name, onChange, {});

    const {
        setValue: onMapLayerChange,
        removeValue: onMapLayerRemove,
    } = useFormArray<
        'layers',
        MapLayerType
    >('layers', onFieldChange);

    const mapLayersError = useMemo(
        () => getErrorObject(error?.layers),
        [error?.layers],
    );

    const handleAddMapLayer = useCallback(() => {
        onFieldChange(
            (oldValue: MapConfigType['layers']) => {
                const safeOldValue = oldValue ?? [];
                const newClientId = randomString();
                const newMapLayer: MapLayerType = {
                    clientId: newClientId,
                    visible: true,
                    order: safeOldValue.length + 1,
                };
                return [...safeOldValue, newMapLayer];
            },
            'layers',
        );
    }, [onFieldChange]);

    const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>();

    const handleLayerClick = useCallback((newLayerId: string) => {
        setSelectedLayerId(newLayerId);
    }, []);

    const handleLayerVisibilityClick = useCallback((oldVal: boolean, index: number) => {
        onFieldChange(
            (oldValue: MapConfigType['layers']) => {
                const safeOldValue = oldValue ?? [];
                const selected = safeOldValue[index];
                if (!selected) {
                    return oldValue;
                }
                const newValue = [
                    ...safeOldValue,
                ];
                newValue.splice(index, 1, { ...selected, visible: !oldVal });
                return newValue;
            },
            'layers',
        );
    }, [onFieldChange]);

    const layerRendererParams = useCallback((
        layerKey: string,
        datum: LayerType,
        index: number,
    ) => ({
        clientId: datum.clientId,
        title: datum.name ?? `Item ${index + 1}`,
        index,
        onClick: handleLayerClick,
        visibility: !!datum.visible,
        selected: layerKey === selectedLayerId,
        onVisibilityClick: () => handleLayerVisibilityClick(!!datum.visible, index),
    }), [
        selectedLayerId,
        handleLayerClick,
        handleLayerVisibilityClick,
    ]);

    const selectedLayer = value?.layers?.find(
        (layerItem) => layerItem.clientId === selectedLayerId,
    );

    const handleLayerOrderChange = useCallback((newOrder: MapLayerType[]) => {
        onFieldChange(reorder(newOrder), 'layers');
    }, [onFieldChange]);

    return (
        <div className={_cs(className, styles.mapEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="Layers"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                {/* FIXME: Restrict the height of this container */}
                <div className={styles.content}>
                    <div className={styles.list}>
                        <SortableList
                            name="layers"
                            className={styles.layers}
                            data={value?.layers}
                            onChange={handleLayerOrderChange}
                            direction="vertical"
                            keySelector={layerKeySelector}
                            rendererParams={layerRendererParams}
                            rendererClassName={styles.layerButton}
                            renderer={MapLayerItem}
                            pending={false}
                            errored={false}
                            filtered={false}
                            showDragOverlay
                        />
                        <Button
                            title="Add attributes"
                            name="addAttributes"
                            onClick={handleAddMapLayer}
                            className={styles.addButton}
                            variant="tertiary"
                            spacing="compact"
                            disabled={disabled}
                        >
                            Add Layer
                        </Button>
                    </div>
                    {isDefined(selectedLayerId) && isDefined(selectedLayer) && (
                        <MapLayerEdit
                            className={styles.mapLayerEdit}
                            contentData={contentData}
                            error={mapLayersError?.[selectedLayerId]}
                            geoDataUploads={geoDataUploads}
                            index={value?.layers?.indexOf(selectedLayer) ?? 0}
                            key={selectedLayerId}
                            onChange={onMapLayerChange}
                            onContentDataChange={onContentDataChange}
                            onGeoDataUploadsChange={onGeoDataUploadsChange}
                            onRemove={onMapLayerRemove}
                            typeOptions={mapLayerTypeOptions}
                            value={selectedLayer}
                        />
                    )}
                </div>
            </ExpandableContainer>
        </div>
    );
}

export default MapEdit;
