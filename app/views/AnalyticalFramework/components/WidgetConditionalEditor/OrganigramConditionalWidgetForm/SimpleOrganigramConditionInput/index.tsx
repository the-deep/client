import React, { useMemo } from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import {
    useFormObject,
    SetValueArg,
    Error,
    PartialForm,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';
import {
    randomString,
} from '@togglecorp/fujs';

import EverySomeInput from '#components/EverySomeInput';
import {
    OrganigramSelectedCondition,
    OrganigramWidget,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';
import {
    flatten,
} from '#utils/common';

type PartialConditionType = PartialForm<
    OrganigramSelectedCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

interface OrganigramContainsConditionInputProps {
    value: PartialConditionType;
    error: Error<PartialConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    index: number;
    parentWidget: OrganigramWidget | undefined;
}

const defaultConditionVal = (): PartialConditionType => ({
    key: `auto-${randomString()}`,
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'organigram-selected',
});

const optionKeySelector = (option: KeyLabelEntity) => option.key;
const optionLabelSelector = (option: KeyLabelEntity) => option.label;

function SimpleOrganigramConditionInput(props: OrganigramContainsConditionInputProps) {
    const {
        value,
        error: riskyError,
        onChange,
        index,
        parentWidget,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultConditionVal);

    const error = getErrorObject(riskyError);

    const arrayError = getErrorString(error?.value);

    const options = parentWidget?.properties?.options;

    const valueOptions = useMemo(
        () => flatten(
            options
                ? [options]
                : [],
            ({ key, label, tooltip, order }) => ({
                key,
                label,
                tooltip,
                order,
            }),
            (item) => item.children,
        ),
        [options],
    );

    return (
        <>
            <EverySomeInput
                name="operatorModifier"
                value={value.operatorModifier}
                onChange={onFieldChange}
                error={error?.operatorModifier}
            />
            <MultiSelectInput
                name="value"
                value={value.value}
                onChange={onFieldChange}
                error={arrayError}
                options={valueOptions}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
            />
        </>
    );
}

export default SimpleOrganigramConditionInput;
