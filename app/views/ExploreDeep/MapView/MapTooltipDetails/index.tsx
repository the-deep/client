import React from 'react';

import styles from './styles.css';

interface Props {
    projectIds: string[];
}

function MapTooltipDetails(props: Props) {
    const {
        projectIds,
    } = props;

    return (
        <div className={styles.mapTooltip}>
            {projectIds.join(', ')}
        </div>
    );
}

export default MapTooltipDetails;
