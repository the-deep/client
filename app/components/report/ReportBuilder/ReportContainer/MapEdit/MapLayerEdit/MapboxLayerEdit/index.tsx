import React from 'react';
import {
    ContainerCard,
    TextInput,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import {
    type MapboxLayerConfigType,
} from '../../../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    value: MapboxLayerConfigType | undefined;
    onChange: (
        value: SetValueArg<MapboxLayerConfigType>,
        name: NAME,
    ) => void;
    error: Error<MapboxLayerConfigType> | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

function MapboxLayerEdit<NAME extends string>(props: Props<NAME>) {
    const {
        value,
        onChange,
        error: riskyError,
        disabled,
        readOnly,
        name,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, MapboxLayerConfigType
    >(name, onChange, {});

    return (
        <ContainerCard
            heading="Layer Properties"
            headingSize="extraSmall"
            contentClassName={styles.mapLayer}
            className={styles.mapLayerEdit}
        >
            <TextInput
                label="Style"
                name="mapboxStyle"
                value={value?.mapboxStyle}
                onChange={onFieldChange}
                error={error?.mapboxStyle}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label="Access Token"
                name="accessToken"
                value={value?.accessToken}
                onChange={onFieldChange}
                error={error?.accessToken}
                disabled={disabled}
                readOnly={readOnly}
            />
        </ContainerCard>
    );
}

export default MapboxLayerEdit;
