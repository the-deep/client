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
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type GeoLocationValue = NonNullable<GeoLocationWidgetAttribute['data']>;
export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N;
    value: GeoLocationValue | null | undefined;
    error: Error<GeoLocationValue> | undefined;
    onChange: (value: GeoLocationValue | undefined, name: N) => void;

    actions?: React.ReactNode;
    icons?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;

    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;

    rightComponent?: React.ReactNode;

}

function GeoLocationWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        actions,
        icons,
        onChange: onChangeFromProps,
        disabled,
        readOnly,
        error: riskyError,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        rightComponent,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: GeoLocationValue['value'] | undefined, inputName: N) => {
            // TODO: Handle points and polygons
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
            actions={actions}
            icons={icons}
        >
            <NonFieldError error={error} />
            <GeoLocationInput
                name={name}
                value={value?.value}
                onChange={onChange}
                disabled={disabled}
                readOnly={readOnly}
                error={getErrorString(error?.value)}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                rightComponent={rightComponent}
            />
        </WidgetWrapper>
    );
}

export default GeoLocationWidgetInput;
