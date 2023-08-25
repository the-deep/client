import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';
import OrgTree from 'react-org-tree';
import {
    Card,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import { OrganigramValue, OrganigramDatum } from '#types/newAnalyticalFramework';
import styles from './styles.css';

interface Props<N extends string> {
    name: N;
    value: OrganigramValue | null | undefined;
    onChange: (value: OrganigramValue | undefined, name: N) => void,
    options: PartialForm<OrganigramDatum, 'key'> | null | undefined;
    error?: string;
    readOnly?: boolean;
    disabled?: boolean;
}

function transformData(data: PartialForm<OrganigramDatum, 'key'>): OrganigramDatum & { id: string } {
    if (data.children) {
        return {
            ...data,
            id: data.key,
            children: data.children.map(transformData) ?? [],
            label: data.label ?? 'Unnamed',
            order: data.order ?? 1,
        };
    }
    return {
        ...data,
        id: data.key,
        children: [],
        label: data.label ?? 'Unnamed',
        order: data.order ?? 1,
    };
}

function OrganigramInput<N extends string>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        disabled,
        readOnly,
        options,
        error,
    } = props;

    // FIXME: handle error

    const handleClick = useCallback(
        (_: Event, data: OrganigramDatum) => {
            if (disabled || readOnly) {
                return;
            }
            if (value?.some((v) => v === data.key)) {
                onChange(value?.filter((v) => v !== data.key), name);
            } else {
                onChange([...(value ?? []), data.key], name);
            }
        },
        [value, onChange, name, readOnly, disabled],
    );

    const isSelected = useCallback(
        (d: OrganigramDatum) => (
            value?.find((v) => v === d.key)
        ),
        [value],
    );

    const renderContent = useCallback(
        (data: OrganigramDatum) => (
            <Card
                className={_cs(styles.card, isSelected(data) && styles.selected)}
                // title={data.tooltip}
            >
                { data.label }
            </Card>
        ),
        [isSelected],
    );

    const data = useMemo(
        () => options && transformData(options),
        [options],
    );

    if (!data) {
        return null;
    }

    return (
        <>
            <NonFieldError error={error} />
            <OrgTree
                data={data}
                vertical
                renderContent={renderContent}
                labelClassName={_cs(
                    disabled && styles.disabled,
                    readOnly && styles.disabled,
                )}
                onClick={handleClick}
            />
        </>
    );
}

export default OrganigramInput;
