import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    ExportType,
} from '#typings';

import styles from './styles.scss';

interface Props {
    buttonKey: ExportType;
    className?: string;
    title: string;
    onExportTypeChange: (key: ExportType) => void;
    isActive: boolean;
    img?: string;
}

function ExportTypePaneButton(props: Props) {
    const {
        buttonKey,
        className,
        title,
        img,
        isActive,
        onExportTypeChange,
    } = props;

    const handleExportTypeClick = useCallback(() => {
        onExportTypeChange(buttonKey);
    }, [buttonKey, onExportTypeChange]);

    return (
        <button
            className={_cs(
                className,
                styles.exportTypeSelect,
                isActive && styles.active,
            )}
            title={title}
            onClick={handleExportTypeClick}
            type="button"
        >
            <img
                className={styles.image}
                src={img}
                alt={title}
            />
        </button>
    );
}

export default ExportTypePaneButton;
