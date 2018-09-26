import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rscg/FaramList';
import SortableListView from '#rscv/SortableListView';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '#rscg/Faram';
import { findDuplicates, randomString } from '#rsu/common';

import { iconNames } from '#constants';
import _ts from '#ts';

import LinkWidgetModal from '#widgetComponents/LinkWidgetModal';

import RowTitle from './RowTitle';
import RowContent from './RowContent';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    data: {},
};

const emptyArray = [];

export default class Matrix1dEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = elem => elem.key;

    static schema = {
        fields: {
            title: [requiredCondition],
            rows: {
                validation: (rows) => {
                    const errors = [];
                    if (!rows || rows.length <= 0) {
                        errors.push(_ts('widgets.editor.matrix1d', 'atLeastOneError'));
                    }

                    const duplicates = findDuplicates(rows, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.matrix1d',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: e => e.key,
                member: {
                    fields: {
                        key: [requiredCondition],
                        color: [],
                        title: [requiredCondition],
                        tooltip: [],
                        cells: {
                            validation: (cells) => {
                                const errors = [];
                                if (!cells || cells.length <= 0) {
                                    errors.push(_ts('widgets.editor.matrix1d', 'atLeastOneError'));
                                }

                                const duplicates = findDuplicates(cells, o => o.value);
                                if (duplicates.length > 0) {
                                    errors.push(_ts(
                                        'widgets.editor.matrix1d',
                                        'duplicationError',
                                        { duplicates: duplicates.join(', ') },
                                    ));
                                }
                                return errors;
                            },

                            keySelector: Matrix1dEditWidget.keyExtractor,
                            member: {
                                fields: {
                                    key: [requiredCondition],
                                    value: [requiredCondition],
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    constructor(props) {
        super(props);

        const {
            title,
            data: { rows = emptyArray },
        } = props;

        this.state = {
            faramValues: {
                title,
                rows,
            },
            faramErrors: {},
            pristine: false,
            showLinkModal: false,
            showNestedLinkModal: false,

            selectedRowKey: rows[0]
                ? Matrix1dEditWidget.keyExtractor(rows[0])
                : undefined,
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

    handleFaramValidationSuccess = (_, faramValues) => {
        const { title, rows } = faramValues;
        this.props.onSave({ rows }, title);
    };

    addRowClick = (rows) => {
        const newRow = {
            key: randomString(16).toLowerCase(),
            color: undefined,
            title: '',
            tooltip: '',
            cells: [],
        };
        this.setState({
            selectedRowKey: Matrix1dEditWidget.keyExtractor(newRow),
        });
        return [
            ...rows,
            newRow,
        ];
    }

    addFromWidgetClick = (rows, _, listOfNewRows) => {
        const newListOfRows = listOfNewRows.map(r => ({
            key: randomString(16).toLowerCase(),
            title: r.label,
            originalWidget: r.originalWidget,
            originalKey: r.originalKey,
            color: undefined,
            tooltip: '',
            cells: [],
        }));
        this.setState({
            showLinkModal: false,
            selectedRowKey: Matrix1dEditWidget.keyExtractor(newListOfRows[0]),
        });
        return [
            ...rows,
            ...newListOfRows,
        ];
    };

    handleLinkModalClose = () => {
        this.setState({ showLinkModal: false });
    }

    handleAddFromWidgetClick = () => {
        this.setState({ showLinkModal: true });
    }

    handleNestedModalChange = (showNestedLinkModal) => {
        this.setState({ showNestedLinkModal });
    }

    rendererParams = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        setSelectedRow: (k) => {
            this.setState({ selectedRowKey: k });
        },
        isSelected: this.state.selectedRowKey === key,
        keyExtractor: Matrix1dEditWidget.keyExtractor,
    })

    renderDragHandle = (key) => {
        const dragHandleClassNames = [styles.dragHandle];
        const { selectedRowKey } = this.state;
        if (selectedRowKey === key) {
            dragHandleClassNames.push(styles.active);
        }

        return (
            <span className={`${iconNames.hamburger} ${dragHandleClassNames.join(' ')}`} />
        );
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            showLinkModal,
            showNestedLinkModal,
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;

        const { rows = [] } = faramValues || {};
        const selectedRowIndex = rows.findIndex(
            row => Matrix1dEditWidget.keyExtractor(row) === this.state.selectedRowKey,
        );

        const modalClassNames = [styles.editModal];
        if (showLinkModal || showNestedLinkModal) {
            modalClassNames.push(styles.disabled);
        }

        return (
            <Modal className={modalClassNames.join(' ')}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Matrix1dEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors
                            faramElement
                            className={styles.error}
                        />
                        <TextInput
                            className={styles.titleInput}
                            faramElementName="title"
                            autoFocus
                            label={_ts('widgets.editor.matrix1d', 'titleLabel')}
                            placeholder={_ts('widgets.editor.matrix1d', 'widgetTitlePlaceholder')}
                            selectOnFocus
                        />
                        <div className={styles.rows} >
                            <FaramList
                                faramElementName="rows"
                                keySelector={Matrix1dEditWidget.keyExtractor}
                            >
                                <NonFieldErrors faramElement className={styles.error} />
                                <header className={styles.header}>
                                    <h4>
                                        {_ts('widgets.editor.matrix1d', 'rowTitle')}
                                    </h4>
                                    <div>
                                        <PrimaryButton
                                            transparent
                                            iconName={iconNames.add}
                                            onClick={this.handleAddFromWidgetClick}
                                        >
                                            {_ts('widgets.editor.matrix1d', 'addFromWidgets')}
                                        </PrimaryButton>
                                        {showLinkModal &&
                                            <LinkWidgetModal
                                                onClose={this.handleLinkModalClose}
                                                widgetKey={this.props.widgetKey}
                                                faramElementName="add-from-widget-btn"
                                                faramAction={this.addFromWidgetClick}
                                            />
                                        }
                                        <PrimaryButton
                                            faramElementName="add-btn"
                                            faramAction={this.addRowClick}
                                            iconName={iconNames.add}
                                            transparent
                                        >
                                            {_ts('widgets.editor.matrix1d', 'addRowButtonTitle')}
                                        </PrimaryButton>
                                    </div>
                                </header>
                                <div className={styles.panels}>
                                    <SortableListView
                                        className={styles.leftPanel}
                                        dragHandleModifier={this.renderDragHandle}
                                        faramElement
                                        rendererParams={this.rendererParams}
                                        itemClassName={styles.item}
                                        renderer={RowTitle}
                                    />
                                    { rows.length > 0 && selectedRowIndex !== -1 &&
                                        <RowContent
                                            index={selectedRowIndex}
                                            widgetKey={this.props.widgetKey}
                                            className={styles.rightPanel}
                                            onNestedModalChange={this.handleNestedModalChange}
                                        />
                                    }
                                </div>
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {_ts('widgets.editor.matrix1d', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {_ts('widgets.editor.matrix1d', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
