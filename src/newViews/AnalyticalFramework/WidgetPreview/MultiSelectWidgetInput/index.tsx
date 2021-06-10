import React from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';

import { MultiSelectValue, MultiSelectWidget, PartialForm } from '../../types';
import WidgetWrapper from '../../Widget';

export type PartialMultiSelectWidget = PartialForm<
    MultiSelectWidget,
    'clientId' | 'type'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialMultiSelectWidget>['data']
>['options']>[number];

const optionKeySelector = (option: Option) => option.clientId;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: MultiSelectValue | null | undefined,
    onChange: (value: MultiSelectValue | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialMultiSelectWidget,
}

function MultiSelectWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange,
        actions,
        widget,
        disabled,
        readOnly,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
        >
            <MultiSelectInput
                name={name}
                options={widget?.data?.options}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                onChange={onChange}
                value={value}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default MultiSelectWidgetInput;
