import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    _cs,
    caseInsensitiveSubmatch,
    getRatingForContentInString as rate,
} from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';
import VirtualizedListView from '#rscv/VirtualizedListView';

import SearchInput from '#rsci/SearchInput';
// import Widget from './Widget';

import {
    renderDroppableWidget,
    isDroppableWidget,
} from '../../widgetUtils';

import styles from './styles.scss';

const propTypes = {
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    closeModal: () => {},
};

const labelSelector = organization => organization.label;

export default class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            isBeingDraggedOver: false,
        };
    }

    handleSearch = (value) => {
        this.setState({ searchValue: value });
    }

    handleOnDragStart = id => (e) => {
        const data = JSON.stringify({
            organizationId: id,
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }


    filterOrganization = memoize((options, value) => {
        const newOptions = options
            .filter(
                option => (
                    value === undefined || caseInsensitiveSubmatch(labelSelector(option), value)
                ),
            )
            .sort((a, b) => (
                rate(value, labelSelector(a)) - rate(value, labelSelector(b))
            ));
        return newOptions;
    });

    /*
    widgetRendererParams = (i, data) => ({
        index: i,
        data,
        sources: this.props.sources,
        className: styles.widget,
    })
    */

    renderWidget = (k, data) => renderDroppableWidget(
        k,
        data,
        this.props.sources,
        {
            containerClassName: styles.widgetContainer,
            className: isDroppableWidget(data.sourceType, data.fieldType)
                ? styles.droppableWidget : styles.widget,
            itemClassName: styles.widgetItem,
        },
    );

    render() {
        const {
            closeModal,
            children,
            fields,
            sources,
        } = this.props;

        const {
            searchValue,
        } = this.state;

        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
                className={styles.modal}
            >
                <ModalHeader title="Stakeholders" />
                <ModalBody className={styles.modalBody}>
                    <div className={styles.left}>
                        <div className={styles.top}>
                            <PrimaryButton
                                className={styles.addOrganizationButton}
                            >
                                Add organization
                            </PrimaryButton>
                            <SearchInput
                                label="Search"
                                placeholder="Any organization"
                                value={searchValue}
                                onChange={this.handleSearch}
                                showHintAndError={false}
                            />
                        </div>
                        <VirtualizedListView
                            className={styles.organizationList}
                            data={this.filterOrganization(sources.organizations, searchValue)}
                            // FIXME: don't use inline methods
                            rendererParams={(key, d) => ({
                                name: d.label,
                                itemKey: key,
                            })}
                            keySelector={item => item.key}

                            // FIXME: use separate component
                            renderer={({ className, name, itemKey }) => (
                                <div
                                    title={name}
                                    className={_cs(styles.organizationItem, className)}
                                    draggable
                                    onDragStart={this.handleOnDragStart(itemKey)}
                                >
                                    { name }
                                </div>
                            )}
                        />
                    </div>
                    <div className={styles.right}>
                        <ListView
                            className={styles.widgetList}
                            data={fields}
                            modifier={this.renderWidget}
                            // rendererParams={this.widgetRendererParams}
                            // renderer={Widget}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <DangerButton
                        onClick={closeModal}
                    >
                        Close
                    </DangerButton>
                </ModalFooter>
            </Modal>
        );
    }
}
