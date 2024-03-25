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
    TextInput,
    Checkbox,
    NumberInput,
    Button,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    type SetValueArg,
    type Error,
    useFormObject,
    getErrorObject,
    analyzeErrors,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import SortableList from '#components/SortableList';
import { reorder } from '#utils/common';
import {
    ReportMapEnumsQuery,
} from '#generated/types';

import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import TextElementsStylesEdit from '../TextElementsStylesEdit';
import MapLayerEdit from './MapLayerEdit';
import MapLayerItem from './MapLayerItem';
import {
    type ContentDataType,
    type MapConfigType,
    type MapLayerType,
    type MapStyleFormType,
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

    const generalFieldMap: (keyof NonNullable<typeof error>)[] = [
        'title',
        'subTitle',
        'mapHeight',
        'zoom',
        'minZoom',
        'centerLatitude',
        'centerLongitude',
        'showScale',
        'scaleBar',
        'enableZoomControls',
    ];

    const layerConfigHasError = isDefined(error?.layers);

    const generalHasError = generalFieldMap.some(
        (key) => analyzeErrors(error?.[key]),
    );

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

    const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>();
    const finalSelectedLayerId = selectedLayerId ?? value?.layers?.[0]?.clientId;

    const handleLayerRemove = useCallback((index: number) => {
        onMapLayerRemove(index);
        setSelectedLayerId(undefined);
    }, [onMapLayerRemove]);

    const handleAddMapLayer = useCallback(() => {
        const newClientId = randomString();
        onFieldChange(
            (oldValue: MapConfigType['layers']) => {
                const safeOldValue = oldValue ?? [];
                const newMapLayer: MapLayerType = {
                    clientId: newClientId,
                    visible: true,
                    order: safeOldValue.length + 1,
                };
                return [...safeOldValue, newMapLayer];
            },
            'layers',
        );
        setSelectedLayerId(newClientId);
    }, [onFieldChange]);

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

    const selectedLayer = value?.layers?.find(
        (layerItem) => layerItem.clientId === finalSelectedLayerId,
    );

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
        selected: layerKey === finalSelectedLayerId,
        onVisibilityClick: () => handleLayerVisibilityClick(!!datum.visible, index),
        errored: analyzeErrors(getErrorObject(error?.layers)?.[layerKey]),
    }), [
        error?.layers,
        finalSelectedLayerId,
        handleLayerClick,
        handleLayerVisibilityClick,
    ]);

    const handleLayerOrderChange = useCallback((newOrder: MapLayerType[]) => {
        onFieldChange(reorder(newOrder), 'layers');
    }, [onFieldChange]);

    const onStyleChange = useFormObject<
        'style', MapStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.mapEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading={generalHasError ? 'General *' : 'General'}
                headingSize="small"
                spacing="compact"
                errored={generalHasError}
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextInput
                    value={value?.title}
                    name="title"
                    label="Title"
                    onChange={onFieldChange}
                    error={error?.title}
                    disabled={disabled}
                />
                <TextInput
                    value={value?.subTitle}
                    name="subTitle"
                    label="Subtitle"
                    onChange={onFieldChange}
                    error={error?.subTitle}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.mapHeight}
                    name="mapHeight"
                    label="Map height"
                    onChange={onFieldChange}
                    error={error?.mapHeight}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.zoom}
                    name="zoom"
                    label="Zoom"
                    onChange={onFieldChange}
                    error={error?.zoom}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.minZoom}
                    name="minZoom"
                    label="minZoom"
                    onChange={onFieldChange}
                    error={error?.minZoom}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.maxZoom}
                    name="maxZoom"
                    label="maxZoom"
                    onChange={onFieldChange}
                    error={error?.maxZoom}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.centerLatitude}
                    name="centerLatitude"
                    label="Center Latitude"
                    onChange={onFieldChange}
                    error={error?.centerLatitude}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.centerLongitude}
                    name="centerLongitude"
                    label="Center Longitude"
                    onChange={onFieldChange}
                    error={error?.centerLongitude}
                    disabled={disabled}
                />
                <Checkbox
                    value={value?.showScale}
                    name="showScale"
                    label="Show scale"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                {value?.showScale && (
                    <Checkbox
                        // TODO: Replace this with boolean segment input
                        value={value?.scaleBar}
                        name="scaleBar"
                        label="Bar type scale"
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                )}
                <Checkbox
                    value={value?.enableZoomControls}
                    name="enableZoomControls"
                    label="Enable zoom controls"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
            </ExpandableContainer>
            <ExpandableContainer
                heading={layerConfigHasError ? 'Layers*' : 'Layers'}
                headingSize="small"
                errored={layerConfigHasError}
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
                    {isDefined(finalSelectedLayerId) && isDefined(selectedLayer) && (
                        <MapLayerEdit
                            className={styles.mapLayerEdit}
                            contentData={contentData}
                            error={mapLayersError?.[finalSelectedLayerId]}
                            geoDataUploads={geoDataUploads}
                            index={value?.layers?.indexOf(selectedLayer) ?? 0}
                            key={finalSelectedLayerId}
                            onChange={onMapLayerChange}
                            onContentDataChange={onContentDataChange}
                            onGeoDataUploadsChange={onGeoDataUploadsChange}
                            onRemove={handleLayerRemove}
                            typeOptions={mapLayerTypeOptions}
                            value={selectedLayer}
                        />
                    )}
                </div>
            </ExpandableContainer>
            <ExpandableContainer
                heading="Styling"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextElementsStylesEdit
                    name="title"
                    label="Title"
                    value={value?.style?.title}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="subTitle"
                    label="Subtitle"
                    value={value?.style?.subTitle}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
            </ExpandableContainer>
        </div>
    );
}

export default MapEdit;
