import React, { useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import NonFieldError from '#components/NonFieldError';

import { GeoLocationWidget } from '#types/newAnalyticalFramework';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { GeoLocationWidgetAttribute } from '#types/newEntry';
import GeoLocationInput from '#components/GeoLocationInput';
import WidgetWrapper from '../WidgetWrapper';

export type PartialGeoLocationWidget = PartialForm<
GeoLocationWidget,
    'key' | 'widgetId' | 'order'
>;

type GeoLocationValue = NonNullable<GeoLocationWidgetAttribute['data']>;
export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N;
    value: GeoLocationValue | null | undefined;
    error: Error<GeoLocationValue> | undefined;
    onChange: (value: GeoLocationValue | undefined, name: N) => void;

    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialGeoLocationWidget;
    geoAreas: GeoArea[] | undefined | null;
    onGeoAreasChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
}

function GeoLocationWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange: onChangeFromProps,
        disabled,
        readOnly,
        error: riskyError,
        geoAreas,
        onGeoAreasChange,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: GeoLocationValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
        >
            <NonFieldError error={error} />
            <GeoLocationInput
                name={name}
                value={value?.value}
                onChange={onChange}
                disabled={disabled || readOnly}
                readOnly={readOnly}
                error={getErrorString(error?.value)}
                geoAreas={geoAreas}
                onGeoAreasChange={onGeoAreasChange}
            />
        </WidgetWrapper>
    );
}

export default GeoLocationWidgetInput;
