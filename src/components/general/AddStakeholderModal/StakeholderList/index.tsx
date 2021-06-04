import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import useDropHandler from '#hooks/useDropHandler';
import {
    List,
    Heading,
} from '@the-deep/deep-ui';

import { BasicOrganization } from '#typings';

import StakeholderRow from './StakeholderRow';

import styles from './styles.scss';


const stakeholderRowKeySelector = (d: BasicOrganization) => d.id;

interface Props {
    className?: string;
    value?: BasicOrganization[];
    onChange: (stakeholders: BasicOrganization[], name: string) => void;
    label: string;
    name: string;
}

function StakeholderList(props: Props) {
    const {
        className,
        onChange,
        value,
        name,
        label,
    } = props;

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        try {
            const data = e.dataTransfer.getData('text');
            const parsedData = JSON.parse(data);
            if (!parsedData || !parsedData.id) {
                throw new Error('Invalid data');
            }

            const { id, title, logoUrl } = parsedData;

            const droppedOrganization = { id, title, logoUrl };
            if (!value) {
                onChange([droppedOrganization], name);
            } else if (value.findIndex(v => v.id === id) === -1) {
                onChange([...value, droppedOrganization], name);
            }
        } catch (ex) {
            console.warn('Only organizations supported');
        }
    }, [value, name, onChange]);

    const {
        dropping,
        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
    } = useDropHandler(handleDrop);

    const onRowRemove = useCallback((id: number) => {
        if (value) {
            onChange(value.filter(v => v.id !== id), name);
        }
    }, [value, name, onChange]);

    const rowRendererParams = useCallback((_, data) => ({
        onRemove: onRowRemove,
        value: data,
    }), [onRowRemove]);

    return (
        <div
            className={_cs(
                styles.stakeholderList,
                className,
                dropping && styles.draggedOver,
            )}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <Heading
                className={styles.label}
                size="small"
            >
                {label}
            </Heading>
            <div className={styles.dropOverlay} />
            <div className={styles.items}>
                <List
                    data={value}
                    renderer={StakeholderRow}
                    keySelector={stakeholderRowKeySelector}
                    rendererClassName={styles.row}
                    rendererParams={rowRendererParams}
                />
            </div>
        </div>
    );
}

export default StakeholderList;
