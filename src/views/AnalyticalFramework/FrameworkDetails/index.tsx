import React from 'react';
import {
    isNotDefined,
} from '@togglecorp/fujs';
import { notifyOnFailure } from '#utils/requestNotify';
import { useRequest } from '#utils/request';
import { AnalyticalFramework } from '#typings';
import _ts from '#ts';

import FrameworkDetailsForm from './FrameworkDetailsForm';
import styles from './styles.scss';

interface Props {
    frameworkId: number;
}

function FrameworkDetails(props: Props) {
    const {
        frameworkId,
    } = props;

    const {
        pending: frameworkGetPending,
        response: analyticalFramework,
    } = useRequest<AnalyticalFramework>({
        skip: isNotDefined(frameworkId),
        url: `server://analysis-frameworks/${frameworkId}/`,
        method: 'GET',
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analyticalFramework', 'title'))({ error: errorBody }),
    });

    return (
        <div className={styles.frameworkDetails}>
            <FrameworkDetailsForm
                frameworkId={frameworkId}
                key={analyticalFramework?.title}
                analyticalFramework={analyticalFramework}
                frameworkGetPending={frameworkGetPending}
            />
        </div>
    );
}

export default FrameworkDetails;
