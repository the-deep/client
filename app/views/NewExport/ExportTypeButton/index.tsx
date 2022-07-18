import React from 'react';
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

function ExportTypeButton(props: Props) {
    const {
        buttonKey,
        className,
        title,
        icon,
        isActive,
        onActiveExportFormatChange,
    } = props;

    return (
        <QuickActionButton
            name={buttonKey}
            className={_cs(
                className,
                styles.exportTypeSelect,
                isActive && styles.active,
            )}
            spacing="loose"
            variant="secondary"
            onClick={onActiveExportFormatChange}
            big
            title={title}
        >
            {icon}
            {buttonKey === 'JSON' && (
                <span className={styles.title}>JSON</span>
            )}
        </QuickActionButton>
    );
}

export default ExportTypeButton;
