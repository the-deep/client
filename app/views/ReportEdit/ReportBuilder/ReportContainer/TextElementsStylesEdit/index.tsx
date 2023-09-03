import React from 'react';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    PurgeNull,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    NumberInput,
} from '@the-deep/deep-ui';

import {
    AnalysisReportTextStyleType,
} from '#generated/types';

type StylesType = PurgeNull<AnalysisReportTextStyleType>;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value?: StylesType | undefined;
    onChange: (
        value: SetValueArg<StylesType | undefined>,
        name: NAME,
    ) => void;
    error?: Error<AnalysisReportTextStyleType>;
    disabled?: boolean;
}

function TextElementStylesEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
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
        <div className={className}>
            <NumberInput
                label="Size"
                value={value?.size}
                name="size"
                onChange={onFieldChange}
                error={error?.size}
                disabled={disabled}
            />
        </div>
    );
}

export default TextElementStylesEdit;
