import React, { useCallback } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Container,
    Message,
    SelectInput,
    TextInput,
    NumberInput,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    IoTrash,
} from 'react-icons/io5';

import {
    AnalysisReportMapLayerTypeEnum,
} from '#generated/types';
import {
    NewEnumEntity,
    newEnumKeySelector,
    newEnumLabelSelector,
} from '#utils/common';
import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import {
    type ContentDataType,
    type MapLayerType,
    type MapLayerConfigType,
} from '../../../../schema';

import SymbolLayerEdit from './SymbolLayer';
import LineLayerEdit from './LineLayerEdit';
import HeatmapLayerEdit from './HeatmapLayerEdit';
import MapboxLayerEdit from './MapboxLayerEdit';

import styles from './styles.css';

const defaultMapLayer = (): MapLayerType => ({
    clientId: randomString(),
});

interface Props {
    value: MapLayerType;
    typeOptions: NewEnumEntity<AnalysisReportMapLayerTypeEnum>[] | undefined | null;
    onChange: (
        value: SetValueArg<MapLayerType>,
        index: number,
    ) => void | undefined;
    onRemove: (index: number) => void;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
    index: number;
    error: Error<MapLayerType> | undefined;
    contentData: ContentDataType[] | undefined;
    onContentDataChange: (newContentData: SetValueArg<ContentDataType[] | undefined>) => void;
    className?: string;
    disabled?: boolean;
    readOnly?: boolean;
}

function MapLayerEdit(props: Props) {
    const {
        value,
        onChange,
        index,
        error: riskyError,
        onRemove,
        disabled,
        readOnly,
        typeOptions,
        geoDataUploads,
        contentData,
        className,
        onGeoDataUploadsChange,
        onContentDataChange,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultMapLayer,
    );

    const onLayerConfigChange = useFormObject<
        'layerConfig', MapLayerConfigType
    >('layerConfig', onFieldChange, {});

    const handleRemoveLayer = useCallback(() => {
        onRemove(index);
    }, [onRemove, index]);

    return (
        <Container
            className={_cs(className, styles.mapLayerEdit)}
            heading={value.name ?? `Item: ${index + 1}`}
            headingSize="extraSmall"
            headerActions={(
                <QuickActionConfirmButton
                    title="Remove Attributes"
                    message="Are you sure you want to remove this layer?"
                    name={index}
                    onConfirm={handleRemoveLayer}
                >
                    <IoTrash />
                </QuickActionConfirmButton>
            )}
            contentClassName={styles.mapLayer}
        >
            <TextInput
                label="Name"
                name="name"
                onChange={onFieldChange}
                error={error?.name}
                value={value.name}
                disabled={disabled}
                readOnly={readOnly}
            />
            <SelectInput
                label="Layer Type"
                name="type"
                value={value?.type}
                onChange={onFieldChange}
                keySelector={newEnumKeySelector}
                labelSelector={newEnumLabelSelector}
                options={typeOptions ?? []}
                error={error?.type}
            />
            <NumberInput
                name="opacity"
                label="Opacity"
                value={value?.opacity}
                onChange={onFieldChange}
                error={error?.opacity}
                disabled={disabled}
                readOnly={readOnly}
            />
            {value?.type === 'SYMBOL_LAYER' && (
                <SymbolLayerEdit
                    name="symbolLayer"
                    contentData={contentData}
                    value={value?.layerConfig?.symbolLayer}
                    onChange={onLayerConfigChange}
                    geoDataUploads={geoDataUploads}
                    onGeoDataUploadsChange={onGeoDataUploadsChange}
                    onContentDataChange={onContentDataChange}
                    error={getErrorObject(error?.layerConfig)?.symbolLayer}
                />
            )}
            {value?.type === 'LINE_LAYER' && (
                <LineLayerEdit
                    name="lineLayer"
                    contentData={contentData}
                    value={value?.layerConfig?.lineLayer}
                    onChange={onLayerConfigChange}
                    geoDataUploads={geoDataUploads}
                    onGeoDataUploadsChange={onGeoDataUploadsChange}
                    onContentDataChange={onContentDataChange}
                    error={getErrorObject(error?.layerConfig)?.lineLayer}
                />
            )}
            {value?.type === 'HEAT_MAP_LAYER' && (
                <HeatmapLayerEdit
                    name="heatmapLayer"
                    contentData={contentData}
                    value={value?.layerConfig?.heatmapLayer}
                    onChange={onLayerConfigChange}
                    geoDataUploads={geoDataUploads}
                    onGeoDataUploadsChange={onGeoDataUploadsChange}
                    onContentDataChange={onContentDataChange}
                    error={getErrorObject(error?.layerConfig)?.heatmapLayer}
                />
            )}
            {value?.type === 'MAPBOX_LAYER' && (
                <MapboxLayerEdit
                    name="mapboxLayer"
                    value={value?.layerConfig?.mapboxLayer}
                    onChange={onLayerConfigChange}
                    error={getErrorObject(error?.layerConfig)?.mapboxLayer}
                />
            )}
            {value?.type === 'POLYGON_LAYER' && (
                <Message
                    message="Polygon layer is not yet available to use."
                />
            )}
        </Container>
    );
}

export default MapLayerEdit;
