import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ListView from '#rscv/List/ListView';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import Button from '#rsca/Button';

import EmmTrigger from '#components/viewer/EmmTrigger';
import EmmEntity from '#components/viewer/EmmEntity';

import _ts from '#ts';

import styles from './styles.scss';

const EmptyComponent = () => '';

const propTypes = {
    className: PropTypes.string,
    closeModal: PropTypes.func,
    emmEntities: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    emmTriggers: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    closeModal: undefined,
    emmEntities: [],
    emmTriggers: [],
};

const emmTriggerRendererParams = (key, data) => ({
    keyword: data.emmKeyword,
    riskFactor: data.emmRiskFactor,
    count: data.count,
});

const emmEntitiesRendererParams = (key, data) => ({
    name: data.name,
    count: data.count,
});

const emmTriggerKeySelector = t => t.emmKeyword;
const emmEntitiesKeySelector = t => t.name;

export default class EmmStatsModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            closeModal,
            emmEntities,
            emmTriggers,
        } = this.props;

        const showEntities = emmEntities.length > 0;
        const showTriggers = emmTriggers.length > 0;

        return (
            <Modal
                className={_cs(className, styles.emmStatsModal)}
                closeOnEscape
                onClose={closeModal}
            >
                <ModalHeader
                    title={_ts('emmStatsModal', 'emmStatsModalTitle')}
                    rightComponent={
                        <Button
                            onClick={closeModal}
                            transparent
                            iconName="close"
                        />
                    }
                />
                <ModalBody className={styles.body}>
                    {showTriggers && (
                        <div className={styles.content}>
                            <header className={styles.header}>
                                <h4>
                                    {_ts('emmStatsModal', 'emmTriggersTitle')}
                                </h4>
                            </header>
                            <ListView
                                className={styles.list}
                                renderer={EmmTrigger}
                                data={emmTriggers}
                                keySelector={emmTriggerKeySelector}
                                rendererParams={emmTriggerRendererParams}
                                emptyComponent={EmptyComponent}
                            />
                        </div>
                    )}
                    {showEntities && (
                        <div className={styles.content}>
                            <header className={styles.header}>
                                <h4>
                                    {_ts('emmStatsModal', 'emmEntitiesTitle')}
                                </h4>
                            </header>
                            <ListView
                                className={styles.list}
                                renderer={EmmEntity}
                                data={emmEntities}
                                keySelector={emmEntitiesKeySelector}
                                rendererParams={emmEntitiesRendererParams}
                                emptyComponent={EmptyComponent}
                            />
                        </div>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}
