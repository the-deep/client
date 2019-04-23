import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
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

import TextInput from '#rsci/TextInput';

import { renderWidget } from '../../widgetUtils';

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
        };
    }

    handleSearch = (value) => {
        this.setState({ searchValue: value });
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

    renderWidget = (k, data) => renderWidget(k, data, this.props.sources, false, true);

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
                <ModalHeader
                    title="Stakeholders"
                />
                <ModalBody className={styles.modalBody}>
                    <div className={styles.left}>
                        <div className={styles.top}>
                            <PrimaryButton
                                className={styles.addOrganizationButton}
                            >
                                Add organization
                            </PrimaryButton>
                            <TextInput
                                label="Search"
                                placeholder="Any organization"
                                value={searchValue}
                                onChange={this.handleSearch}
                            />
                        </div>
                        <VirtualizedListView
                            className={styles.organizationList}
                            data={this.filterOrganization(sources.organizations, searchValue)}
                            // FIXME: don't use inline methods
                            rendererParams={(key, d) => ({ name: d.label })}
                            keySelector={item => item.key}
                            renderer={({ name }) => <div>{name}</div>}
                        />
                    </div>
                    <div className={styles.right}>
                        <ListView
                            data={fields}
                            modifier={this.renderWidget}
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
