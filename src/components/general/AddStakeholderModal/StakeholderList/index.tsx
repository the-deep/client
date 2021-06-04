import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    List,
    Heading,
    DropContainer,
} from '@the-deep/deep-ui';

import { BasicOrganization } from '#typings';

import StakeholderRow from './StakeholderRow';

import styles from './styles.scss';

const stakeholderRowKeySelector = (d: number) => d;

interface Props {
    className?: string;
    value?: number[];
    onChange: (stakeholders: number[], name: string) => void;
    options: BasicOrganization[];
    onOptionsChange: (value: BasicOrganization[]) => void;
    label: string;
    name: string;
}

function StakeholderList(props: Props) {
    const {
        className,
        onChange,
        value,
        options,
        onOptionsChange,
        name,
        label,
    } = props;

    const handleDrop = useCallback((val?: Record<'id' | 'title' | 'logoUrl', string | unknown>) => {
        if (val) {
            const typedVal = val as BasicOrganization;
            if (options.findIndex(option => option.id === typedVal.id) < 0) {
                onOptionsChange([...options, typedVal]);
            }
            if (!value) {
                onChange([typedVal.id], name);
            } else if (value.findIndex(v => v === typedVal.id) === -1) {
                onChange([...value, typedVal.id], name);
            }
        }
    }, [value, name, onChange, onOptionsChange, options]);

    const getValueLabel = useCallback((val: number) =>
        options.find(v => v.id === val)?.title,
    [options]);

    const onRowRemove = useCallback((id: number) => {
        if (value) {
            onChange(value.filter(v => v !== id), name);
        }
    }, [value, name, onChange]);

    const rowRendererParams = useCallback((_, val) => ({
        onRemove: onRowRemove,
        value: val,
        displayValue: getValueLabel(val),
    }), [onRowRemove, getValueLabel]);

    return (
        <DropContainer
            className={_cs(
                styles.stakeholderList,
                className,
            )}
            name="stakeholder"
            onDrop={handleDrop}
        >
            <Heading
                className={styles.label}
                size="small"
            >
                {label}
            </Heading>
            <div className={styles.items}>
                <List
                    data={value}
                    renderer={StakeholderRow}
                    keySelector={stakeholderRowKeySelector}
                    rendererClassName={styles.row}
                    rendererParams={rowRendererParams}
                />
            </div>
        </DropContainer>
    );
}

export default StakeholderList;
