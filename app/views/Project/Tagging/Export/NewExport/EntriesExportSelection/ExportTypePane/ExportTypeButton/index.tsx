import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
} from '@the-deep/deep-ui';

import {
    ExportFormatEnum,
} from '#generated/types';

import styles from './styles.css';

interface Props {
    buttonKey: ExportFormatEnum;
    className?: string;
    title: string;
    onActiveExportFormatChange: (key: ExportFormatEnum) => void;
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
        onActiveExportFormatChange,
    } = props;

    const handleExportTypeClick = useCallback(() => {
        onActiveExportFormatChange(buttonKey);
    }, [buttonKey, onActiveExportFormatChange]);

    return (
        <QuickActionButton
            name={undefined}
            className={_cs(
                className,
                styles.exportTypeSelect,
                isActive && styles.active,
            )}
            spacing="loose"
            onClick={handleExportTypeClick}
            big
            title={title}
        >
            {icon}
        </QuickActionButton>
    );
}

export default ExportTypePaneButton;
