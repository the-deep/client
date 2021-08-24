import React from 'react';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    ListView,
    Tag,
    ContainerCard,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import { EmmTrigger, EmmEntity } from '../schema';

import styles from './styles.css';

const emmTriggerRendererParams = (_: string, data: EmmTrigger) => ({
    className: styles.tag,
    children: isTruthyString(data.emmRiskFactor)
        ? `${data.emmRiskFactor}: ${data.emmKeyword} (${data.count})`
        : `${data.emmKeyword} (${data.count})`,
});

const emmEntitiesRendererParams = (_: string, data: EmmEntity) => ({
    className: styles.tag,
    children: data.name,
});

const emmTriggerKeySelector = (t: EmmTrigger) => t.emmKeyword;
const emmEntitiesKeySelector = (t: EmmEntity) => t.name;

interface Props {
    className?: string;
    emmEntities?: EmmEntity[];
    emmTriggers?: EmmTrigger[];
}

function EmmStatsModal(props: Props) {
    const {
        className,
        emmEntities,
        emmTriggers,
    } = props;

    const showEntities = emmEntities && emmEntities?.length > 0;
    const showTriggers = emmTriggers && emmTriggers?.length > 0;

    return (
        <div className={_cs(className, styles.body)}>
            {showTriggers && (
                <ContainerCard
                    heading={_ts('emmStatsModal', 'emmTriggersTitle')}
                    headingSize="small"
                    className={styles.content}
                >
                    <ListView
                        className={styles.list}
                        renderer={Tag}
                        data={emmTriggers}
                        keySelector={emmTriggerKeySelector}
                        rendererParams={emmTriggerRendererParams}
                    />
                </ContainerCard>
            )}
            {showEntities && (
                <ContainerCard
                    heading={_ts('emmStatsModal', 'emmEntitiesTitle')}
                    headingSize="small"
                    className={styles.content}
                >
                    <ListView
                        className={styles.list}
                        renderer={Tag}
                        data={emmEntities}
                        keySelector={emmEntitiesKeySelector}
                        rendererParams={emmEntitiesRendererParams}
                    />
                </ContainerCard>
            )}
        </div>
    );
}

export default EmmStatsModal;
