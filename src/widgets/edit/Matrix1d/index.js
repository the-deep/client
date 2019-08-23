import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramList, requiredCondition } from '@togglecorp/faram';
import {
    getDuplicates,
    randomString,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import SortableListView from '#rscv/SortableListView';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';
import _ts from '#ts';
import _cs from '#cs';

import RowTitle from './RowTitle';
import RowContent from './RowContent';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
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

    static keySelector = elem => elem.key;
    static rowTitleSelector = d => d.title;

    static schema = {
        fields: {
            title: [requiredCondition],
            rows: {
                validation: (rows) => {
                    const errors = [];
                    if (!rows || rows.length <= 0) {
                        errors.push(_ts('widgets.editor.matrix1d', 'atLeastOneError'));
                    }

                    const duplicates = getDuplicates(rows, o => o.title);
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

                                const duplicates = getDuplicates(cells, o => o.value);
                                if (duplicates.length > 0) {
                                    errors.push(_ts(
                                        'widgets.editor.matrix1d',
                                        'duplicationError',
                                        { duplicates: duplicates.join(', ') },
                                    ));
                                }
                                return errors;
                            },

                            keySelector: Matrix1dEditWidget.keySelector,
                            member: {
                                fields: {
                                    key: [requiredCondition],
                                    value: [requiredCondition],
                                    tooltip: [],
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    static rowsModifier = rows => rows.map(r => ({
        key: randomString(16),
        title: r.label,
        originalWidget: r.originalWidget,
        originalKey: r.originalKey,
        color: undefined,
        tooltip: '',
        cells: [],
    }));

    static getDataFromFaramValues = (data) => {
        const { rows } = data;
        return { rows };
    };

    static getTitleFromFaramValues = data => data.title;

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
            pristine: true,
            hasError: false,

            selectedRowKey: rows[0]
                ? Matrix1dEditWidget.keySelector(rows[0])
                : undefined,
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        const selectedRowKey = faramInfo.lastItem ? (
            Matrix1dEditWidget.keySelector(faramInfo.lastItem)
        ) : (
            this.state.selectedRowKey
        );

        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
            selectedRowKey,
        });

        const {
            widgetKey,
            onChange,
        } = this.props;
        onChange(
            widgetKey,
            Matrix1dEditWidget.getDataFromFaramValues(faramValues),
            Matrix1dEditWidget.getTitleFromFaramValues(faramValues),
        );
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            widgetKey,
            onSave,
            closeModal,
        } = this.props;

        onSave(
            widgetKey,
            Matrix1dEditWidget.getDataFromFaramValues(faramValues),
            Matrix1dEditWidget.getTitleFromFaramValues(faramValues),
        );
        closeModal();
    };

    addRowClick = (rows) => {
        const newRow = {
            key: randomString(16),
            color: undefined,
            title: '',
            tooltip: '',
            cells: [],
        };
        this.setState({
            selectedRowKey: Matrix1dEditWidget.keySelector(newRow),
        });
        return [
            ...rows,
            newRow,
        ];
    }

    rendererParams = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        setSelectedRow: (k) => {
            this.setState({ selectedRowKey: k });
        },
        isSelected: this.state.selectedRowKey === key,
        keySelector: Matrix1dEditWidget.keySelector,
    })

    renderDragHandle = (key) => {
        const { selectedRowKey } = this.state;

        const className = _cs(
            styles.dragHandle,
            selectedRowKey === key && styles.active,
        );

        return (
            <Icon
                className={className}
                name="hamburger"
            />
        );
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
        } = this.state;

        const {
            closeModal,
            title,
        } = this.props;

        const { rows = [] } = faramValues || {};
        const selectedRowIndex = rows.findIndex(
            row => Matrix1dEditWidget.keySelector(row) === this.state.selectedRowKey,
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
                            label={_ts('widgets.editor.matrix1d', 'titleLabel')}
                            placeholder={_ts('widgets.editor.matrix1d', 'widgetTitlePlaceholder')}
                            selectOnFocus
                        />
                        <div className={styles.rows} >
                            <FaramList
                                faramElementName="rows"
                                keySelector={Matrix1dEditWidget.keySelector}
                            >
                                <NonFieldErrors
                                    faramElement
                                    className={styles.error}
                                />
                            </FaramList>
                            <header className={styles.header}>
                                <h4>
                                    {_ts('widgets.editor.matrix1d', 'rowTitle')}
                                </h4>
                                <div className={styles.buttonContainer} >
                                    <h5>
                                        {_ts('widgets.editor.matrix1d', 'addRowsFromTitle')}
                                    </h5>
                                    <GeoLink
                                        faramElementName="rows"
                                        dataModifier={Matrix1dEditWidget.rowsModifier}
                                        titleSelector={Matrix1dEditWidget.rowTitleSelector}
                                        onModalVisibilityChange={this.handleModalVisiblityChange}
                                    />
                                    <LinkWidgetModalButton
                                        faramElementName="rows"
                                        widgetKey={this.props.widgetKey}
                                        titleSelector={Matrix1dEditWidget.rowTitleSelector}
                                        dataModifier={Matrix1dEditWidget.rowsModifier}
                                        onModalVisibilityChange={this.handleModalVisiblityChange}
                                    />
                                    <FaramList
                                        faramElementName="rows"
                                        keySelector={Matrix1dEditWidget.keySelector}
                                    >
                                        <AccentButton
                                            faramElementName="add-btn"
                                            faramAction={this.addRowClick}
                                            iconName="clipboard"
                                            transparent
                                        >
                                            {_ts('widgets.editor.matrix1d', 'addRowButtonTitle')}
                                        </AccentButton>
                                    </FaramList>
                                </div>
                            </header>
                            <FaramList
                                faramElementName="rows"
                                keySelector={Matrix1dEditWidget.keySelector}
                            >
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
                        <DangerConfirmButton
                            onClick={closeModal}
                            confirmationMessage={_ts('widgets.editor.matrix1d', 'cancelConfirmMessage')}
                            skipConfirmation={pristine}
                        >
                            {_ts('widgets.editor.matrix1d', 'cancelButtonLabel')}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {_ts('widgets.editor.matrix1d', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
