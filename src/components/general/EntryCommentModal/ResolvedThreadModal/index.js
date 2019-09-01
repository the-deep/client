import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ListView from '#rscv/List/ListView';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Button from '#rsca/Button';

import _ts from '#ts';
import Thread from '../Thread';

import styles from './styles.scss';

const EmptyComponent = () => null;

const propTypes = {
    className: PropTypes.string,
    resolvedThreads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func,
};

const defaultProps = {
    resolvedThreads: [],
    className: undefined,
    closeModal: () => {},
};

const threadsKeySelector = d => d.key;

export default class ResolvedThreadModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    resolvedThreadRendererParams = (key, thread) => ({
        className: styles.thread,
        comments: thread,
        isResolved: true,
    });

    render() {
        const {
            className,
            closeModal,
            resolvedThreads,
        } = this.props;

        return (
            <Modal className={styles.resolvedThreads}>
                <ModalHeader
                    title={_ts('entryComments', 'resolvedCommentsModalHeader')}
                    rightComponent={
                        <Button
                            onClick={closeModal}
                            transparent
                            iconName="close"
                        />
                    }
                />
                <ModalBody className={_cs(styles.modalBody, className)}>
                    <ListView
                        className={styles.threads}
                        data={resolvedThreads}
                        keySelector={threadsKeySelector}
                        renderer={Thread}
                        rendererParams={this.resolvedThreadRendererParams}
                        emptyComponent={EmptyComponent}
                    />
                </ModalBody>
            </Modal>
        );
    }
}
