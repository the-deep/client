import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    RawButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    datasetId: string;
    title: string;
    active: boolean;
    onClick: (datasetId: string) => void;
}

function DatasetItem(props: Props) {
    const {
        title,
        datasetId,
        onClick,
        active,
    } = props;

    return (
        <RawButton
            name={datasetId}
            onClick={onClick}
            className={_cs(
                styles.frameworkItem,
                active && styles.selected,
            )}
        >
            <div className={styles.title}>
                {title}
            </div>
        </RawButton>
    );
}

export default DatasetItem;
