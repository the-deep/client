import React, { useCallback, useMemo } from 'react';
import { listToMap, isNotDefined } from '@togglecorp/fujs';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';

import { breadcrumb } from '#utils/common';
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

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;

    widget: PartialGeoLocationWidget;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;

    widgetHints?: string[];
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
        actions,
        icons,
        error: riskyError,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        widgetHints,
    } = props;
    console.warn('Geo hints', widgetHints);

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

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(
            geoAreaOptions,
            (d) => d.id,
            (d) => breadcrumb([d.regionTitle, d.adminLevelTitle, d.title]),
        );
        return value?.value?.map((v) => optionsMap?.[v]);
    }, [geoAreaOptions, value]);

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            {readOnly ? (
                selectedValues?.map((val) => (
                    <div key={val}>
                        {val}
                    </div>
                )) ?? (<div>-</div>)
            ) : (
                <>
                    <NonFieldError error={error} />
                    <GeoLocationInput
                        name={name}
                        value={value?.value}
                        onChange={onChange}
                        disabled={disabled || readOnly}
                        readOnly={readOnly}
                        error={getErrorString(error?.value)}
                        geoAreaOptions={geoAreaOptions}
                        onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                        showList
                    />
                </>
            )}
        </WidgetWrapper>
    );
}

export default GeoLocationWidgetInput;
