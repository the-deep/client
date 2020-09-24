import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import EmmTrigger from '#components/viewer/EmmTrigger';
import EmmEntity from '#components/viewer/EmmEntity';

import _ts from '#ts';

import styles from './styles.scss';

const emmTriggerKeySelector = t => t.emmKeyword;
const emmEntitiesKeySelector = t => t.name;

const emmTriggerRendererParams = (key, data) => ({
    keyword: data.emmKeyword,
    riskFactor: data.emmRiskFactor,
    count: data.count,
});

const emmEntitiesRendererParams = (key, data) => ({
    name: data.name,
});

const propTypes = {
    className: PropTypes.string,
    emmEntities: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    emmTriggers: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    emmEntities: [],
    emmTriggers: [],
};

function EmmStatsModal(props) {
    const {
        className,
        emmEntities,
        emmTriggers,
    } = props;

    const showEntities = emmEntities.length > 0;
    const showTriggers = emmTriggers.length > 0;

    if (!showTriggers && !showEntities) {
        return null;
    }

    return (
        <div className={_cs(className, styles.body)}>
            {showTriggers && (
                <div className={styles.content}>
                    <header className={styles.header}>
                        <h4 className={styles.heading}>
                            {_ts('emmStatsModal', 'emmTriggersTitle')}
                        </h4>
                    </header>
                    <ListView
                        className={styles.list}
                        renderer={EmmTrigger}
                        data={emmTriggers}
                        keySelector={emmTriggerKeySelector}
                        rendererParams={emmTriggerRendererParams}
                        emptyComponent={null}
                    />
                </div>
            )}
            {showEntities && (
                <div className={styles.content}>
                    <header className={styles.header}>
                        <h4 className={styles.heading}>
                            {_ts('emmStatsModal', 'emmEntitiesTitle')}
                        </h4>
                    </header>
                    <ListView
                        className={styles.list}
                        renderer={EmmEntity}
                        data={emmEntities}
                        keySelector={emmEntitiesKeySelector}
                        rendererParams={emmEntitiesRendererParams}
                        emptyComponent={null}
                    />
                </div>
            )}
        </div>
    );
}

EmmStatsModal.propTypes = propTypes;
EmmStatsModal.defaultProps = defaultProps;

export default EmmStatsModal;
