import React, { useCallback } from 'react';

import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';
import SimpleListInput from '#rsci/SimpleListInput';
import useDropHandler from '#hooks/useDropHandler';


import _ts from '#ts';

import styles from './styles.scss';

interface Props {
    containerClassName?: string;
    onChange: (values: (number[] | undefined)) => void;
    value: number[];
}

function OrganizationField(props: Props) {
    const { containerClassName, onChange, value, ...otherProps } = props;

    const handleDragEnter = useCallback(() => {
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        try {
            const data = e.dataTransfer.getData('text');
            const parsedData = JSON.parse(data);
            if (!parsedData || !parsedData.organizationId) {
                throw new Error('Invalid data');
            }

            const { organizationId } = parsedData;

            if (!value) {
                onChange([organizationId]);
            } else if (value.findIndex(v => v === organizationId) === -1) {
                onChange([...value, organizationId]);
            }
        } catch (ex) {
            console.warn('Only organizations supported');
        }
    }, [
        value,
        onChange,
    ]);

    const {
        dropping,
        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
    } = useDropHandler(handleDragEnter, handleDrop);

    return (
        <div
            className={_cs(
                styles.widget,
                containerClassName,
                dropping && styles.draggedOver,
            )}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className={styles.dropMessage}>
                {_ts('project.detail.stakeholders', 'dropHereMessage')}
            </div>
            <SimpleListInput
                {...otherProps}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export default FaramInputElement(OrganizationField);
