import React, { useState, useCallback } from 'react';

import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';
import Confirm from '#rscv/Modal/Confirm';
import SimpleListInput from '#rsci/SimpleListInput';

import _ts from '#ts';

import styles from './styles.scss';

interface Props {
    containerClassName?: string;
    onChange: (values: (number | undefined)[]) => void;
    value: number[];
}

function OrganizationField(props: Props) {
    const { containerClassName, onChange, value, ...otherProps } = props;

    const [droppedOrganizationId, setDroppedOrganizationId] = useState(undefined);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isBeingDraggedOver, setIsBeingDraggedOver] = useState(false);
    const [dragEnterCount, setDragEnterCount] = useState(0);

    const handleDragEnter = useCallback(() => {
        if (dragEnterCount === 0) {
            setIsBeingDraggedOver(true);
        }
        const newDraEnterCount = dragEnterCount + 1;
        setDragEnterCount(newDraEnterCount);
    }, [dragEnterCount, setIsBeingDraggedOver, setDragEnterCount]);

    const handleDragLeave = useCallback(() => {
        const newDraEnterCount = dragEnterCount - 1;
        setDragEnterCount(newDraEnterCount);

        if (newDraEnterCount === 0) {
            setIsBeingDraggedOver(false);
        }
    }, [dragEnterCount, setDragEnterCount, setIsBeingDraggedOver]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text');
        try {
            const parsedData = JSON.parse(data);
            if (parsedData && parsedData.organizationId) {
                const { organizationId } = parsedData;

                if (!value) {
                    onChange([organizationId]);
                } else if (value.findIndex(v => v === organizationId) === -1) {
                    const intercept = false;

                    if (intercept) {
                        setShowConfirmation(true);
                        setDroppedOrganizationId(organizationId);
                    } else {
                        onChange([...value, organizationId]);
                    }
                }
            }
        } catch (ex) {
            console.warn('Only organizations supported');
        }
        setDragEnterCount(0);
        setIsBeingDraggedOver(false);
    }, [
        value,
        onChange,
        setDragEnterCount,
        setIsBeingDraggedOver,
        setShowConfirmation,
        setDroppedOrganizationId,
    ]);

    const handleConfirmation = useCallback((confirm: boolean) => {
        if (confirm) {
            onChange([
                ...value,
                droppedOrganizationId,
            ]);
        }
        setDroppedOrganizationId(undefined);
        setShowConfirmation(false);
    }, [
        value,
        droppedOrganizationId,
        onChange,
        setDroppedOrganizationId,
        setShowConfirmation,
    ]);

    return (
        <div
            className={_cs(
                styles.widget,
                containerClassName,
                isBeingDraggedOver && styles.draggedOver,
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className={styles.dropMessage}>
                {_ts('project.detail.stakeholders', 'dropHereMessage')}
            </div>
            <SimpleListInput
                {...otherProps}
                value={value}
                onChange={onChange}
            />
            <Confirm
                show={showConfirmation}
                onClose={handleConfirmation}
            >
                <p>
                    {_ts('project.detail.stakeholders', 'dropConfirmation')}
                </p>
            </Confirm>
        </div>
    );
}

export default FaramInputElement(OrganizationField);
