import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    _cs,
    caseInsensitiveSubmatch,
    getRatingForContentInString as rate,
} from '@togglecorp/fujs';

import Modalize from '#rscg/Modalize';
import Modal from '#rscv/Modal';
import Icon from '#rscg/Icon';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';

import SearchInput from '#rsci/SearchInput';
import HighlightableTextOutput from './HighlightableTextOutput';
// import Widget from './Widget';

import {
    renderDroppableWidget,
    isDroppableWidget,
} from '../../widgetUtils';

import AddOrganizationModal from './AddOrganizationModal';
import styles from './styles.scss';

const PrimaryModalButton = Modalize(PrimaryButton);

const propTypes = {
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    closeModal: () => {},
};

const labelSelector = organization => organization.label;

const MAX_DISPLAY_ORGANIZATIONS = 50;

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

    handleOnDragStart = (id, isDonor, name) => (e) => {
        const data = JSON.stringify({
            organizationId: id,
            isDonor,
            organizationName: name,
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }

    filterOrganization = memoize((options, value) => {
        if (value === '') {
            return {
                isCapped: false,
                organizations: [],
            };
        }

        const newOptions = options
            .filter(
                option => (
                    value === undefined || caseInsensitiveSubmatch(labelSelector(option), value)
                ),
            )
            .sort((a, b) => (
                rate(value, labelSelector(a)) - rate(value, labelSelector(b))
            ));

        const resultsCapped = newOptions.length > MAX_DISPLAY_ORGANIZATIONS;
        return {
            isCapped: resultsCapped,
            organizations: newOptions.slice(0, MAX_DISPLAY_ORGANIZATIONS),
        };
    });

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

        const results = this.filterOrganization(sources.organizations, searchValue);
        const {
            isCapped,
            organizations,
        } = results;

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
                            <header className={styles.header}>
                                <h3 className={styles.heading}>
                                    Organizations
                                </h3>
                                <PrimaryModalButton
                                    className={styles.addOrganizationButton}
                                    modal={<AddOrganizationModal />}
                                >
                                    Add new
                                </PrimaryModalButton>
                            </header>
                            <SearchInput
                                className={styles.searchInput}
                                label="Search"
                                placeholder="Any organization"
                                value={searchValue}
                                onChange={this.handleSearch}
                                showHintAndError={false}
                            />
                        </div>
                        { isCapped && (
                            <div className={styles.capWarning}>
                                <Icon
                                    name="info"
                                    className={styles.icon}
                                />
                                <div className={styles.text}>
                                    Showing only top {MAX_DISPLAY_ORGANIZATIONS} results
                                </div>
                            </div>
                        )}
                        <ListView
                            className={styles.organizationList}
                            data={organizations}
                            emptyComponent={() => (
                                <div className={styles.emptyComponent}>
                                    { searchValue.length === 0 ? (
                                        'Start typing above to search for the organization'
                                    ) : (
                                        'No result found, try different search text'
                                    )}
                                </div>
                            )}
                            // FIXME: don't use inline methods
                            rendererParams={(key, d) => ({
                                name: d.label,
                                itemKey: key,
                                logo: d.logo,
                                isDonor: d.donor,
                            })}
                            keySelector={item => item.key}

                            // FIXME: use separate component
                            renderer={({ className, name, itemKey, logo, isDonor }) => (
                                <div
                                    title={name}
                                    className={_cs(styles.organizationItem, className)}
                                    draggable
                                    onDragStart={this.handleOnDragStart(itemKey, isDonor, name)}
                                >
                                    <div className={styles.logo}>
                                        { logo ? (
                                            <img
                                                className={styles.image}
                                                src={logo}
                                                alt={name.substr(0, 1)}
                                            />
                                        ) : (
                                            <Icon name="people" />
                                        )}
                                    </div>
                                    <HighlightableTextOutput
                                        className={styles.name}
                                        text={name}
                                        highlightText={searchValue}
                                    />
                                    { isDonor && (
                                        <div className={styles.donorFlag}>
                                            Donor
                                        </div>
                                    )}
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
