import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import DangerButton from '#rsca/Button/DangerButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';

import {
    isDroppableWidget,
    getProps,
} from '#entities/editAry';

import _ts from '#ts';

import OrganizationList from './OrganizationList';
import Widget from './Widget';

import styles from './styles.scss';

const propTypes = {
    closeModal: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    sources: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    fields: PropTypes.array,
};

const defaultProps = {
    closeModal: () => {},
    sources: {},
    fields: [],
};

const fieldKeySelector = d => d.id;

export default class StakeholderModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    fieldRendererParams = (key, data) => {
        const {
            sources,
        } = this.props;

        const {
            fieldType,
            sourceType,
        } = data;

        const newFieldType = fieldType === 'multiselect'
            ? 'listInput'
            : fieldType;

        const widgetProps = getProps(data, sources);

        const isDroppable = isDroppableWidget(data.sourceType, data.fieldType);

        return {
            ...widgetProps,
            fieldType: newFieldType,
            sourceType,
            hidden: false,

            isDroppable,
            containerClassName: styles.widgetContainer,
            className: isDroppable ? styles.droppableWidget : styles.widget,
            itemClassName: styles.widgetItem,
        };
    }

    render() {
        const {
            closeModal,
            fields,
            sources,
        } = this.props;

        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
                className={styles.modal}
            >
                <ModalHeader title={_ts('assessment.metadata.stakeholder', 'stakeholdersModalTitle')} />
                <ModalBody className={styles.modalBody}>
                    <OrganizationList
                        sources={sources}
                        className={styles.organizationList}
                    />
                    <div className={styles.right}>
                        <ListView
                            className={styles.widgetList}
                            data={fields}
                            keySelector={fieldKeySelector}

                            renderer={Widget}
                            rendererParams={this.fieldRendererParams}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <DangerButton onClick={closeModal}>
                        {_ts('assessment.metadata.stakeholder', 'closeModalButtonLabel')}
                    </DangerButton>
                </ModalFooter>
            </Modal>
        );
    }
}
