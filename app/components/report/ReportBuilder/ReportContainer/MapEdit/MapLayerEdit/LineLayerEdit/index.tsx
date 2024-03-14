import React, { useCallback, useMemo } from 'react';
import {
    ContainerCard,
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
} from '@togglecorp/toggle-form';

import GeoDataSelectInput, {
    ReportGeoUploadType,
} from '#components/report/ReportBuilder/GeoDataSelectInput';
import NonFieldError from '#components/NonFieldError';

import {
    type ContentDataType,
    type LineLayerConfigType,
    type LineLayerStyleConfigType,
} from '../../../../../schema';
import LineLayerStylesEdit from '../../../LineLayerStylesEdit';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    value: LineLayerConfigType | undefined;
    onChange: (
        value: SetValueArg<LineLayerConfigType>,
        name: NAME,
    ) => void;
    error: Error<LineLayerConfigType> | undefined;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
    contentData: ContentDataType[] | undefined;
    onContentDataChange: (newContentData: SetValueArg<ContentDataType[] | undefined>) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function LineLayerEdit<NAME extends string>(props: Props<NAME>) {
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
        NAME, LineLayerConfigType
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

    const onStyleChange = useFormObject<
        'style', LineLayerStyleConfigType
    >('style', onFieldChange, {});

    console.log('error', error);

    return (
        <ContainerCard
            heading="Layer Properties"
            headingSize="extraSmall"
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
            <LineLayerStylesEdit
                name="line"
                label="Line Style"
                value={value?.style?.line}
                onChange={onStyleChange}
            />
        </ContainerCard>
    );
}

export default LineLayerEdit;
