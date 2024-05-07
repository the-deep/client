import React, { useCallback, useMemo } from 'react';
import {
    ContainerCard,
    Checkbox,
    NumberInput,
    SelectInput,
} from '@the-deep/deep-ui';
import { useParams } from 'react-router-dom';
import {
    randomString,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
    analyzeErrors,
} from '@togglecorp/toggle-form';

import {
    AnalysisReportVariableType,
} from '#generated/types';
import GeoDataSelectInput, {
    ReportGeoUploadType,
} from '#components/report/ReportBuilder/GeoDataSelectInput';
import NonFieldError from '#components/NonFieldError';

import ColorSchemeInput from '../ColorSchemeInput';
import {
    type ContentDataType,
    type HeatMapLayerConfigType,
} from '../../../../../schema';

import styles from './styles.css';

const columnKeySelector = (item: AnalysisReportVariableType) => item.clientId ?? '';
const columnLabelSelector = (item: AnalysisReportVariableType) => item.name ?? '';

interface Props<NAME extends string> {
    name: NAME;
    value: HeatMapLayerConfigType | undefined;
    onChange: (
        value: SetValueArg<HeatMapLayerConfigType>,
        name: NAME,
    ) => void;
    error: Error<HeatMapLayerConfigType> | undefined;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
    contentData: ContentDataType[] | undefined;
    onContentDataChange: (newContentData: SetValueArg<ContentDataType[] | undefined>) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function HeatMapLayerEdit<NAME extends string>(props: Props<NAME>) {
    const {
        value,
        onChange,
        error: riskyError,
        contentData,
        onContentDataChange,
        disabled,
        readOnly,
        name,
        geoDataUploads,
        onGeoDataUploadsChange,
    } = props;

    const error = getErrorObject(riskyError);

    const {
        reportId,
        projectId,
    } = useParams<{
        projectId: string | undefined,
        reportId: string | undefined,
    }>();

    const onFieldChange = useFormObject<
        NAME, HeatMapLayerConfigType
    >(name, onChange, {});

    const handleFileUploadChange = useCallback((newFileUploadId: string | undefined) => {
        const newReferenceId = randomString();
        onContentDataChange((oldVal) => {
            if (!oldVal) {
                return ([{
                    clientId: newReferenceId,
                    clientReferenceId: newReferenceId,
                    upload: newFileUploadId,
                }]);
            }
            const selectedIndex = (oldVal ?? [])?.findIndex(
                (item) => item.clientReferenceId === value?.contentReferenceId,
            );
            if (selectedIndex === -1 && isDefined(newFileUploadId)) {
                return ([
                    ...oldVal,
                    {
                        clientId: newReferenceId,
                        clientReferenceId: newReferenceId,
                        upload: newFileUploadId,
                    },
                ]);
            }
            const newVal = [...oldVal];
            if (selectedIndex !== -1 && isNotDefined(newFileUploadId)) {
                newVal.splice(
                    selectedIndex,
                    1,
                );
            } else {
                newVal.splice(
                    selectedIndex,
                    1,
                    {
                        clientId: newReferenceId,
                        clientReferenceId: newReferenceId,
                        upload: newFileUploadId,
                    },
                );
            }
            return newVal;
        });
        onFieldChange(newReferenceId, 'contentReferenceId');
    }, [
        onFieldChange,
        value?.contentReferenceId,
        onContentDataChange,
    ]);

    const fileId = useMemo(() => (
        contentData?.find((item) => item.clientReferenceId === value?.contentReferenceId)?.upload
    ), [
        contentData,
        value?.contentReferenceId,
    ]);

    const propertyOptions = useMemo(() => (
        geoDataUploads?.find((item) => item.id === fileId)?.metadata?.geojson?.variables
    ), [
        geoDataUploads,
        fileId,
    ]);

    return (
        <ContainerCard
            heading="Layer Properties"
            headingSize="extraSmall"
            errored={analyzeErrors(error)}
            contentClassName={styles.mapLayer}
            className={styles.mapLayerEdit}
        >
            <NonFieldError error={error} />
            {projectId && reportId && (
                <GeoDataSelectInput
                    name="contentReferenceId"
                    value={fileId}
                    onChange={handleFileUploadChange}
                    projectId={projectId}
                    reportId={reportId}
                    options={geoDataUploads}
                    label="Dataset"
                    onOptionsChange={onGeoDataUploadsChange}
                    types={['GEOJSON']}
                    disabled={disabled}
                    readOnly={readOnly}
                    error={error?.contentReferenceId}
                />
            )}
            <SelectInput
                label="Weight Property Key"
                name="weightPropertyKey"
                value={value?.weightPropertyKey}
                onChange={onFieldChange}
                keySelector={columnKeySelector}
                labelSelector={columnLabelSelector}
                error={error?.weightPropertyKey}
                options={propertyOptions}
                disabled={disabled}
                readOnly={readOnly}
            />
            <Checkbox
                label="Weighted"
                name="weighted"
                value={value?.weighted}
                onChange={onFieldChange}
                disabled={disabled}
                readOnly={readOnly}
            />
            <NumberInput
                label="Blur"
                name="blur"
                value={value?.blur}
                error={error?.blur}
                onChange={onFieldChange}
                disabled={disabled}
                readOnly={readOnly}
            />
            <NumberInput
                label="Radius"
                name="radius"
                value={value?.radius}
                error={error?.radius}
                onChange={onFieldChange}
                disabled={disabled}
                readOnly={readOnly}
            />
            <NumberInput
                label="Scale Data Max"
                name="scaleDataMax"
                value={value?.scaleDataMax}
                error={error?.scaleDataMax}
                onChange={onFieldChange}
                disabled={disabled}
                readOnly={readOnly}
            />
            <ColorSchemeInput
                name="fillPalette"
                value={value?.fillPalette}
                onChange={onFieldChange}
                error={error?.fillPalette}
            />
        </ContainerCard>
    );
}

export default HeatMapLayerEdit;
