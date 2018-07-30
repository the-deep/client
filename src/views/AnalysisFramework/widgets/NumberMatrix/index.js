import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '#rs/components/Input/TextInput';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import SortableListView from '#rs/components/View/SortableListView';
import Faram, { requiredCondition } from '#rs/components/Input/Faram';
import FaramList from '#rs/components/Input/Faram/FaramList';
import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rs/components/View/MultiViewContainer';
import { findDuplicates, randomString } from '#rsu/common';

import TabTitle from '#components/TabTitle';

import _ts from '#ts';
import { iconNames } from '#constants';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
};

const defaultProps = {
    data: {},
};

export default class NumberMatrixOverview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static rowKeyExtractor = d => d.key;

    static schema = {
        fields: {
            title: [requiredCondition],
            rowHeaders: {
                validation: (rowHeaders) => {
                    const errors = [];
                    if (!rowHeaders || rowHeaders.length <= 0) {
                        errors.push(_ts('framework', 'atLeastOneError'));
                    }

                    const duplicates = findDuplicates(rowHeaders, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'framework',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                member: {
                    fields: {
                        title: [requiredCondition],
                        key: [requiredCondition],
                    },
                },
            },
            columnHeaders: {
                validation: (columnHeaders) => {
                    const errors = [];
                    if (!columnHeaders || columnHeaders.length <= 0) {
                        errors.push(_ts('framework', 'atLeastOneError'));
                    }

                    const duplicates = findDuplicates(columnHeaders, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'framework',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                member: {
                    fields: {
                        title: [requiredCondition],
                        key: [requiredCondition],
                    },
                },
            },
        },
    };

    static faramInfoForAdd = {
        newElement: () => ({
            key: randomString(16).toLowerCase(),
            title: '',
        }),
    }

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                rowHeaders,
                columnHeaders,
            },
        } = props;

        this.state = {
            faramValues: { title, rowHeaders, columnHeaders },
            faramErrors: {},
            pristine: false,
            selectedTab: 'rowHeaders',
        };

        this.tabs = {
            rowHeaders: _ts('framework.numberMatrixWidget', 'rowsLabel'),
            columnHeaders: _ts('framework.numberMatrixWidget', 'columnsLabel'),
        };

        this.views = {
            rowHeaders: {
                component: () => (
                    <FaramList faramElementName="rowHeaders">
                        <SortableListView
                            className={styles.editList}
                            dragHandleClassName={styles.dragHandle}
                            faramElement
                            itemClassName={styles.sortableUnit}
                            keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                            renderer={InputRow}
                            rendererParams={NumberMatrixOverview.rendererParams}
                        />
                    </FaramList>
                ),
                wrapContainer: true,
            },
            columnHeaders: {
                component: () => (
                    <FaramList faramElementName="columnHeaders">
                        <SortableListView
                            className={styles.editList}
                            dragHandleClassName={styles.dragHandle}
                            faramElement
                            itemClassName={styles.sortableUnit}
                            keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                            renderer={InputRow}
                            rendererParams={NumberMatrixOverview.rendererParams}
                        />
                    </FaramList>
                ),
                wrapContainer: true,
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (faramValues) => {
        const { title, ...otherProps } = faramValues;
        this.props.onSave(otherProps, title);
    };

    handleTabSelect = (selectedTab) => {
        this.setState({ selectedTab });
    }

    renderTabsWithButton = () => {
        const { selectedTab } = this.state;

        const buttonLabel = selectedTab === 'rowHeaders' ? (
            _ts('framework.numberMatrixWidget', 'addRowUnitButtonLabel')
        ) : (
            _ts('framework.numberMatrixWidget', 'addColumnUnitButtonLabel')
        );

        return (
            <div className={styles.tabsContainer}>
                <FaramList faramElementName={selectedTab}>
                    <NonFieldErrors
                        faramElement
                        className={styles.nonFieldErrors}
                    />
                </FaramList>
                <FixedTabs
                    className={styles.tabs}
                    tabs={this.tabs}
                    active={selectedTab}
                    onClick={this.handleTabSelect}
                    modifier={this.renderTab}
                >
                    <FaramList faramElementName={selectedTab}>
                        <PrimaryButton
                            faramAction="add"
                            faramInfo={NumberMatrixOverview.faramInfoForAdd}
                            iconName={iconNames.add}
                            title={buttonLabel}
                            transparent
                        >
                            {buttonLabel}
                        </PrimaryButton>
                    </FaramList>
                </FixedTabs>
            </div>
        );
    }

    renderTab = (tabKey) => {
        const title = this.tabs[tabKey];

        return (
            <TabTitle
                title={title}
                faramElementName={tabKey}
            />
        );
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            selectedTab,
        } = this.state;

        const {
            title,
            onClose,
        } = this.props;

        const TabsWithButton = this.renderTabsWithButton;

        return (
            <Modal
                className={styles.editModal}
                onClose={this.handleEditModalClose}
            >
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={NumberMatrixOverview.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors
                            className={styles.nonFieldErrors}
                            faramElement
                        />
                        <TextInput
                            className={styles.title}
                            faramElementName="title"
                            label={_ts('framework.numberMatrixWidget', 'titleLabel')}
                            placeholder={_ts('framework.numberMatrixWidget', 'titlePlaceholderScale')}
                            autoFocus
                            selectOnFocus
                        />
                        <TabsWithButton />
                        <MultiViewContainer
                            views={this.views}
                            containerClassName={styles.modalUnitContainer}
                            active={selectedTab}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {_ts('framework.numberMatrixWidget', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {_ts('framework.numberMatrixWidget', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
