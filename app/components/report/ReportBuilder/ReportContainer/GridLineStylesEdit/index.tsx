import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    PurgeNull,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    Heading,
    NumberInput,
    ColorInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import {
    AnalysisReportGridLineStyleType,
} from '#generated/types';

import styles from './styles.css';

type StylesType = PurgeNull<AnalysisReportGridLineStyleType>;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    label?: string;
    value?: StylesType | undefined;
    onChange: (
        value: SetValueArg<StylesType | undefined>,
        name: NAME,
    ) => void;
    error?: Error<AnalysisReportGridLineStyleType>;
    disabled?: boolean;
}

function GridLineElementStylesEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        label,
        error: riskyError,
        disabled,
        name,
        onChange,
    } = props;

    const onFieldChange = useFormObject<
        NAME, StylesType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    return (
        <div className={_cs(className, styles.gridLineStylesEdit)}>
            {label && (
                <Heading size="extraSmall">{label}</Heading>
            )}
            <NonFieldError error={error} />
            <div className={styles.inputs}>
                <NumberInput
                    value={value?.lineOpacity}
                    name="lineOpacity"
                    label="Grid opacity"
                    onChange={onFieldChange}
                    error={error?.lineOpacity}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.lineWidth}
                    name="lineWidth"
                    label="Grid width"
                    onChange={onFieldChange}
                    error={error?.lineWidth}
                    disabled={disabled}
                />
                <ColorInput
                    value={value?.lineColor}
                    name="lineColor"
                    // label="Grid heading"
                    onChange={onFieldChange}
                    // error={error?.legendHeading}
                    // disabled={disabled}
                />
            </div>
        </div>
    );
}

export default GridLineElementStylesEdit;
