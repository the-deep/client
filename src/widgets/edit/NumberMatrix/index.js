import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import SortableListView from '#rscv/SortableListView';
import Faram, { requiredCondition } from '#rscg/Faram';
import FaramList from '#rscg/FaramList';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import { getDuplicates, randomString } from '#rsu/common';

import TabTitle from '#components/general/TabTitle';

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
                        errors.push(_ts('widgets.editor.numberMatrix', 'atLeastOneError'));
                    }

                    const duplicates = getDuplicates(rowHeaders, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.numberMatrix',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: NumberMatrixOverview.rowKeyExtractor,
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
                        errors.push(_ts('widgets.editor.numberMatrix', 'atLeastOneError'));
                    }

                    const duplicates = getDuplicates(columnHeaders, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.numberMatrix',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: NumberMatrixOverview.rowKeyExtractor,
                member: {
                    fields: {
                        title: [requiredCondition],
                        key: [requiredCondition],
                    },
                },
            },
        },
    };

    static addOptionClick = options => ([
        ...options,
        {
            key: randomString(16),
            title: '',
        },
    ])

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
            pristine: true,
            hasError: false,
            selectedTab: 'rowHeaders',
        };

        this.tabs = {
            rowHeaders: _ts('widgets.editor.numberMatrix', 'rowsLabel'),
            columnHeaders: _ts('widgets.editor.numberMatrix', 'columnsLabel'),
        };

        this.views = {
            rowHeaders: {
                component: () => (
                    <FaramList
                        faramElementName="rowHeaders"
                        keySelector={NumberMatrixOverview.rowKeyExtractor}
                    >
                        <SortableListView
                            className={styles.editList}
                            dragHandleClassName={styles.dragHandle}
                            faramElement
                            itemClassName={styles.sortableUnit}
                            renderer={InputRow}
                            rendererParams={NumberMatrixOverview.rendererParams}
                        />
                    </FaramList>
                ),
                wrapContainer: true,
            },
            columnHeaders: {
                component: () => (
                    <FaramList
                        faramElementName="columnHeaders"
                        keySelector={NumberMatrixOverview.rowKeyExtractor}
                    >
                        <SortableListView
                            className={styles.editList}
                            dragHandleClassName={styles.dragHandle}
                            faramElement
                            itemClassName={styles.sortableUnit}
                            renderer={InputRow}
                            rendererParams={NumberMatrixOverview.rendererParams}
                        />
                    </FaramList>
                ),
                wrapContainer: true,
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const { title, ...otherProps } = faramValues;
        this.props.onSave(otherProps, title);
    };

    handleTabSelect = (selectedTab) => {
        this.setState({ selectedTab });
    }

    tabRendererParams = (tabKey, data) => ({
        faramElementName: tabKey,
        title: data,
    });

    renderTabsWithButton = () => {
        const { selectedTab } = this.state;

        const buttonLabel = selectedTab === 'rowHeaders' ? (
            _ts('widgets.editor.numberMatrix', 'addRowUnitButtonLabel')
        ) : (
            _ts('widgets.editor.numberMatrix', 'addColumnUnitButtonLabel')
        );

        return (
            <div className={styles.tabsContainer}>
                <FaramList faramElementName={selectedTab}>
                    <NonFieldErrors
                        faramElement
                        className={styles.nonFieldErrors}
                    />
                </FaramList>
                <ScrollTabs
                    className={styles.tabs}
                    tabs={this.tabs}
                    active={selectedTab}
                    onClick={this.handleTabSelect}
                    renderer={TabTitle}
                    rendererParams={this.tabRendererParams}
                >
                    <FaramList faramElementName={selectedTab}>
                        <PrimaryButton
                            faramElementName="add-btn"
                            faramAction={NumberMatrixOverview.addOptionClick}
                            iconName={iconNames.add}
                            title={buttonLabel}
                            transparent
                        >
                            {buttonLabel}
                        </PrimaryButton>
                    </FaramList>
                </ScrollTabs>
            </div>
        );
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
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
                            label={_ts('widgets.editor.numberMatrix', 'titleLabel')}
                            placeholder={_ts('widgets.editor.numberMatrix', 'titlePlaceholderScale')}
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
                        <DangerConfirmButton
                            onClick={onClose}
                            confirmationMessage={_ts('widgets.editor.numberMatrix', 'cancelConfirmMessage')}
                            skipConfirmation={pristine}
                        >
                            {_ts('widgets.editor.numberMatrix', 'cancelButtonLabel')}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {_ts('widgets.editor.numberMatrix', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
