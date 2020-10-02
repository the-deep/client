import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ResizableH from '#rscv/Resizable/ResizableH';

import styles from './styles.scss';

interface QualityControlProps {
    className?: string;
    projectId: number;
}

function QualityControl(props: QualityControlProps) {
    const {
        className,
        // projectId,
    } = props;

    return (
        <div className={_cs(className, styles.qualityControl)}>
            <ResizableH
                className={styles.resizableContainer}
                leftContainerClassName={styles.left}
                leftChild={(
                    <div className={styles.frameworkSelection}>
                        Framework selection
                    </div>
                )}
                rightContainerClassName={styles.right}
                rightChild={(
                    <div className={styles.entryList}>
                        Entry list
                    </div>
                )}
            />
        </div>
    );
}

export default QualityControl;
