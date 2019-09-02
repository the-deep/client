import React from 'react';
import PropTypes from 'prop-types';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import memoize from 'memoize-one';

import Modal from '#rscv/Modal';
import FormattedDate from '#rscv/FormattedDate';
import ListView from '#rscv/List/ListView';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import TextOutput from '#components/general/TextOutput';
import Button from '#rsca/Button';

import _ts from '#ts';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    history: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func,
};

const defaultProps = {
    className: undefined,
    closeModal: () => {},
};

const historyKeySelector = h => h.id;

export default class EditHistoryModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getSortedHistory = memoize(history => (
        history.sort((a, b) => compareDate(b.createdAt, a.createdAt))
    ));

    historyRendererParams = (key, data) => ({
        label: (
            <FormattedDate
                value={data.createdAt}
                mode="dd-MM-yyyy hh:mm aaa"
            />
        ),
        labelClassName: styles.date,
        valueClassName: styles.value,
        value: data.text,
        type: 'block',
        className: styles.historyItem,
    });

    render() {
        const {
            className,
            history,
            closeModal,
        } = this.props;

        const sortedHistory = this.getSortedHistory(history);

        return (
            <Modal
                className={styles.modal}
                closeOnEscape
                onClose={closeModal}
            >
                <ModalHeader
                    title={_ts('entryComments', 'textHistoryTitle')}
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
                        data={sortedHistory}
                        keySelector={historyKeySelector}
                        renderer={TextOutput}
                        rendererParams={this.historyRendererParams}
                    />
                </ModalBody>
            </Modal>
        );
    }
}
