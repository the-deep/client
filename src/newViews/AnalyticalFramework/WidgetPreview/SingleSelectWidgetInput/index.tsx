import React from 'react';
import {
    SelectInput,
} from '@the-deep/deep-ui';

import { SingleSelectWidget, PartialForm } from '../../types';
import WidgetWrapper from '../../Widget';

export type PartialSingleSelectWidget = PartialForm<
    SingleSelectWidget,
    'clientId' | 'type'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialSingleSelectWidget>['data']
>['options']>[number];

const optionKeySelector = (option: Option) => option.clientId;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: string | null | undefined,
    onChange: (value: string | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialSingleSelectWidget,
}

function SingleSelectWidgetInput<N extends string>(props: Props<N>) {
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
            <SelectInput
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

export default SingleSelectWidgetInput;
