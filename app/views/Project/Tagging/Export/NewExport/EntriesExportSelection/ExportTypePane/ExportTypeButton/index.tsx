import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    ExportType,
} from '#types';

import styles from './styles.css';

interface Props {
    buttonKey: ExportType;
    className?: string;
    title: string;
    onExportTypeChange: (key: ExportType) => void;
    isActive: boolean;
    icon?: React.ReactNode;
}

function ExportTypePaneButton(props: Props) {
    const {
        buttonKey,
        className,
        title,
        icon,
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
            {icon}
        </button>
    );
}

export default ExportTypePaneButton;
