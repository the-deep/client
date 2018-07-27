import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import FaramElement from '#rs/components/Input/Faram/FaramElement';
import FaramList from '#rs/components/Input/Faram/FaramList';
import SortableListView from '#rs/components/View/SortableListView';
import Button from '#rs/components/Action/Button';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import TextInput from '#rs/components/Input/TextInput';
import ColorInput from '#rs/components/Input/ColorInput';
import Faram, { requiredCondition } from '#rs/components/Input/Faram';
import { findDuplicates, randomString } from '#rs/utils/common';

import { iconNames } from '#constants';
import _ts from '#ts';

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


const Text = FaramElement('errorIndicator')(({ index, isSelected, hasError, title, className }) => (
    <span className={className}>
        { isSelected ? '#' : ''}
        {title || `Row ${index + 1}`}
        { hasError ? '?' : ''}
    </span>
));

const InputRow = ({ index, data, setSelectedRow, isSelected }) => (
    <div className={styles.sortableUnit}>
        <Button
            onClick={() => setSelectedRow(data.key)}
            transparent
        >
            <Text
                title={data.title}
                isSelected={isSelected}
                faramElementName={String(index)}
                index={index}
                className={styles.title}
            />
        </Button>
        <DangerButton
            // className={styles.deleteButton}
            iconName={iconNames.delete}
            faramAction="remove"
            faramInfo={{
                callback: (i, newValue) => {
                    const newIndex = Math.min(i, newValue.length - 1);
                    const newKey = newIndex !== -1 ? newValue[newIndex].key : undefined;
                    setSelectedRow(newKey);
                },
            }}
            // FIXME: use strings
            title="Remove Row"
            faramElementIndex={index}
            transparent
        />
    </div>
);

const InputCell = ({ index }) => (
    <div className={styles.sortableUnit}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                faramElementName="value"
                autoFocus
                label={`Cell ${index + 1}`}
                selectOnFocus
            />
        </FaramGroup>
        <DangerButton
            iconName={iconNames.delete}
            faramAction="remove"
            // FIXME: use strings
            title="Remove Cell"
            faramElementIndex={index}
            transparent
        />
    </div>
);

export default class DefaultEditWidget extends React.PureComponent {
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

    static faramInfoForAnotherAdd = {
        newElement: () => ({
            key: randomString(16).toLowerCase(),
            value: '',
        }),
    }

    constructor(props) {
        super(props);

        const {
            title,
            data: { rows },
        } = props;
        this.state = {
            faramValues: {
                title,
                rows,
            },
            faramErrors: {},
            pristine: false,

            selectedRowKey: rows[0] ? rows[0].key : undefined,
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
            this.setState({ selectedRowKey: value.key });
        },
    }

    anotherRendererParams = (key, elem, i) => ({
        index: i,
    })

    rendererParams = (key, elem, i) => ({
        index: i,
        data: elem,
        setSelectedRow: (k) => {
            this.setState({ selectedRowKey: k });
        },
        isSelected: this.state.selectedRowKey === key,
    })


    renderContent = ({ selectedRowIndex }) => (
        <div>
            <FaramGroup
                faramElementName={String(selectedRowIndex)}
            >
                <NonFieldErrors faramElement />
                <div className={styles.content}>
                    <ColorInput
                        // className={styles.input}
                        faramElementName="color"
                        label="Color"
                    />
                    <TextInput
                        className={styles.input}
                        faramElementName="title"
                        // FIXME: use strings
                        label={`Row ${selectedRowIndex + 1}`}
                        autoFocus
                    />
                    <TextInput
                        className={styles.input}
                        faramElementName="tooltip"
                        // FIXME: use strings
                        label="Tooltip"
                    />
                </div>
                <FaramList faramElementName="cells">
                    <NonFieldErrors faramElement />
                    <header className={styles.header}>
                        <h4>
                            {/* FIXME: use strings */}
                            Cells
                        </h4>
                        <PrimaryButton
                            faramAction="add"
                            // FIXME: add this
                            faramInfo={DefaultEditWidget.faramInfoForAnotherAdd}
                            iconName={iconNames.add}
                            transparent
                        >
                            {/* FIXME: use strings */}
                            Add Cell
                        </PrimaryButton>
                    </header>
                    <SortableListView
                        className={styles.editOptionList}
                        dragHandleClassName={styles.dragHandle}
                        faramElement
                        keyExtractor={DefaultEditWidget.keyExtractor}
                        rendererParams={this.anotherRendererParams}
                        itemClassName={styles.item}
                        renderer={InputCell}
                    />
                </FaramList>
            </FaramGroup>
        </div>
    );


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

        const cancelButtonLabel = 'Cancel';
        const saveButtonLabel = 'Save';

        const { rows = [] } = faramValues || {};

        const selectedRowIndex = rows.findIndex(row => row.key === this.state.selectedRowKey);

        const Content = this.renderContent;

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={DefaultEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors faramElement />
                        <TextInput
                            className={styles.titleInput}
                            faramElementName="title"
                            autoFocus
                            label={_ts('framework.excerptWidget', 'titleLabel')}
                            placeholder={_ts('framework.excerptWidget', 'widgetTitlePlaceholder')}
                            selectOnFocus
                        />
                        <div className={styles.optionInputs} >
                            <FaramList faramElementName="rows">
                                <NonFieldErrors faramElement />
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
                                <div className={styles.mainContent}>
                                    <SortableListView
                                        className={styles.editOptionList}
                                        dragHandleClassName={styles.dragHandle}
                                        faramElement
                                        keyExtractor={DefaultEditWidget.keyExtractor}
                                        rendererParams={this.rendererParams}
                                        itemClassName={styles.item}
                                        renderer={InputRow}
                                    />
                                    { rows.length > 0 && selectedRowIndex !== -1 &&
                                        <Content
                                            selectedRowIndex={selectedRowIndex}
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
