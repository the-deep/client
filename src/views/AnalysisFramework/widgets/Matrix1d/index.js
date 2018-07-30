import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rs/components/Input/Faram/FaramList';
import SortableListView from '#rs/components/View/SortableListView';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import TextInput from '#rs/components/Input/TextInput';
import Faram, { requiredCondition } from '#rs/components/Input/Faram';
import { findDuplicates, randomString } from '#rsu/common';

import { iconNames } from '#constants';
import _ts from '#ts';

import RowTitle from './RowTitle';
import RowContent from './RowContent';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

const emptyArray = [];

export default class Matrix1dEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            rows: {
                validation: (rows) => {
                    const errors = [];
                    if (!rows || rows.length <= 0) {
                        // FIXME: use strings
                        errors.push('There should be at least 1 row.');
                    }

                    const duplicates = findDuplicates(rows, o => o.title);
                    if (duplicates.length > 0) {
                        // FIXME: use strings
                        errors.push(`Duplicate rows are not allowed: ${duplicates.join(', ')}`);
                    }
                    return errors;
                },
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
                                    // FIXME: use strings
                                    errors.push('There should be at least 1 cell.');
                                }

                                const duplicates = findDuplicates(cells, o => o.value);
                                if (duplicates.length > 0) {
                                    // FIXME: use strings
                                    errors.push(`Duplicate cells are not allowed: ${duplicates.join(', ')}`);
                                }
                                return errors;
                            },
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

    static keyExtractor = elem => elem.key;

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

    handleFaramValidationSuccess = (faramValues) => {
        const { title, rows } = faramValues;
        this.props.onSave({ rows }, title);
    };

    faramInfoForAdd = {
        newElement: () => ({
            key: randomString(16).toLowerCase(),
            color: undefined,
            title: '',
            tooltip: '',
            cells: [],
        }),
        callback: (value) => {
            this.setState({
                selectedRowKey: Matrix1dEditWidget.keyExtractor(value),
            });
        },
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
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;

        // FIXME: Use strings
        const cancelButtonLabel = 'Cancel';
        const saveButtonLabel = 'Save';

        const { rows = [] } = faramValues || {};
        const selectedRowIndex = rows.findIndex(
            row => Matrix1dEditWidget.keyExtractor(row) === this.state.selectedRowKey,
        );

        return (
            <Modal className={styles.editModal}>
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
                            label={_ts('framework.excerptWidget', 'titleLabel')}
                            placeholder={_ts('framework.excerptWidget', 'widgetTitlePlaceholder')}
                            selectOnFocus
                        />
                        <div className={styles.rows} >
                            <FaramList faramElementName="rows">
                                <NonFieldErrors faramElement className={styles.error} />
                                <header className={styles.header}>
                                    <h4>
                                        {/* FIXME: use strings */}
                                        Rows
                                    </h4>
                                    <PrimaryButton
                                        faramAction="add"
                                        faramInfo={this.faramInfoForAdd}
                                        iconName={iconNames.add}
                                        transparent
                                    >
                                        {/* FIXME: use strings */}
                                        Add Row
                                    </PrimaryButton>
                                </header>
                                <div className={styles.panels}>
                                    <SortableListView
                                        className={styles.leftPanel}
                                        dragHandleModifier={this.renderDragHandle}
                                        faramElement
                                        keyExtractor={Matrix1dEditWidget.keyExtractor}
                                        rendererParams={this.rendererParams}
                                        itemClassName={styles.item}
                                        renderer={RowTitle}
                                    />
                                    { rows.length > 0 && selectedRowIndex !== -1 &&
                                        <RowContent
                                            index={selectedRowIndex}
                                            className={styles.rightPanel}
                                        />
                                    }
                                </div>
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
