import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';
import { connect } from 'react-redux';

import update from '../../../vendor/react-store/utils/immutable-update';
import { randomString } from '../../../vendor/react-store/utils/common';
import NumberInput from '../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import List from '../../../vendor/react-store/components/View/List';
import BoundError from '../../../components/BoundError';

import { iconNames } from '../../../constants';
import { afStringsSelector } from '../../../redux';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: undefined,
};

const DragHandle = SortableHandle(() => (
    <span className={`${iconNames.hamburger} drag-handle`} />
));

const emptyObject = {};
const emptyList = [];

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
@CSSModules(styles)
export default class NumberMatrixOverview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        const rowHeaders = (this.props.data || emptyObject).rowHeaders || emptyList;
        const columnHeaders = (this.props.data || emptyObject).columnHeaders || emptyList;

        this.state = {
            showEditModal: false,
            rowHeaders,
            columnHeaders,
            title: props.title,
        };

        this.props.editAction(this.handleEdit);
    }

    onRowSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            rowHeaders: arrayMove(this.state.rowHeaders, oldIndex, newIndex),
        });
    };

    onColumnSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            columnHeaders: arrayMove(this.state.columnHeaders, oldIndex, newIndex),
        });
    };

    getEditRowUnits = (key, data, index) => (
        <this.SortableRowUnit key={key} index={index} value={{ key, data }} />
    )

    getEditColumnUnits = (key, data, index) => (
        <this.SortableColumnUnit key={key} index={index} value={{ key, data }} />
    )

    SortableRowUnit = SortableElement(({ value: { data, key } }) => (
        <div
            className={`${styles['row-col-element']} ${styles['draggable-item']}`}
            key={key}
        >
            <DragHandle />
            <TextInput
                className={styles['title-input']}
                label={this.props.afStrings('titleLabel')}
                placeholder={this.props.afStrings('titlePlaceholderRow')}
                onChange={(value) => { this.handleRowUnitTitleInputChange(key, value); }}
                value={data.title}
                showHintAndError={false}
                autoFocus
            />
            <TextInput
                className={styles['title-input']}
                label={this.props.afStrings('tooltipTitle')}
                placeholder={this.props.afStrings('tooltipPlaceholder')}
                onChange={(value) => { this.handleRowUnitTooltipInputChange(key, value); }}
                value={data.tooltip}
                showHintAndError={false}
            />
            <DangerButton
                className={styles['delete-button']}
                onClick={() => { this.handleRowUnitRemoveButtonClick(key); }}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    ))

    SortableColumnUnit = SortableElement(({ value: { data, key } }) => (
        <div
            className={`${styles['row-col-element']} ${styles['draggable-item']}`}
            key={key}
        >
            <DragHandle />
            <TextInput
                className={styles['title-input']}
                label={this.props.afStrings('titleLabel')}
                placeholder={this.props.afStrings('titlePlaceholderColumn')}
                onChange={(value) => { this.handleColUnitTitleInputChange(key, value); }}
                value={data.title}
                showHintAndError={false}
                autoFocus
            />
            <TextInput
                className={styles['title-input']}
                label={this.props.afStrings('tooltipTitle')}
                placeholder={this.props.afStrings('tooltipPlaceholder')}
                onChange={(value) => { this.handleColUnitTooltipInputChange(key, value); }}
                value={data.tooltip}
                showHintAndError={false}
            />
            <DangerButton
                className={styles['delete-button']}
                onClick={() => { this.handleColUnitRemoveButtonClick(key); }}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    ))

    SortableRowList = SortableContainer(({ items: rowHeaders }) => {
        let additionalStyle = '';

        if (rowHeaders.length === 0) {
            additionalStyle = styles['no-items'];
        }

        return (
            <ListView
                className={`${styles.list} ${additionalStyle}`}
                data={rowHeaders}
                keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                modifier={this.getEditRowUnits}
            />
        );
    })

    SortableColumnList = SortableContainer(({ items: columnHeaders }) => {
        let additionalStyle = '';

        if (columnHeaders.length === 0) {
            additionalStyle = styles['no-items'];
        }

        return (
            <ListView
                className={`${styles.list} ${additionalStyle}`}
                data={columnHeaders}
                keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                modifier={this.getEditColumnUnits}
            />
        );
    })

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            rowHeaders: (this.props.data || emptyObject).rowHeaders || emptyList,
            columnHeaders: (this.props.data || emptyObject).columnHeaders || emptyList,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { rowHeaders, columnHeaders, title } = this.state;
        const newData = {
            ...this.props.data,
            rowHeaders,
            columnHeaders,
        };
        this.props.onChange(
            newData,
            title,
        );
    }

    handleRowUnitTitleInputChange = (key, value) => {
        const rowIndex = this.state.rowHeaders.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                title: { $set: value },
            },
        };
        const newRowHeaders = update(this.state.rowHeaders, settings);

        this.setState({ rowHeaders: newRowHeaders });
    }

    handleRowUnitTooltipInputChange = (key, value) => {
        const rowIndex = this.state.rowHeaders.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                tooltip: { $set: value },
            },
        };
        const newRowHeaders = update(this.state.rowHeaders, settings);

        this.setState({ rowHeaders: newRowHeaders });
    }

    handleColUnitTitleInputChange = (key, value) => {
        const rowIndex = this.state.columnHeaders.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                title: { $set: value },
            },
        };
        const newColumnHeaders = update(this.state.columnHeaders, settings);

        this.setState({ columnHeaders: newColumnHeaders });
    }

    handleColUnitTooltipInputChange = (key, value) => {
        const rowIndex = this.state.columnHeaders.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                tooltip: { $set: value },
            },
        };
        const newColumnHeaders = update(this.state.columnHeaders, settings);

        this.setState({ columnHeaders: newColumnHeaders });
    }

    handleColUnitRemoveButtonClick = (key) => {
        const settings = {
            $filter: d => d.key !== key,
        };
        const newColumnHeaders = update(this.state.columnHeaders, settings);

        this.setState({ columnHeaders: newColumnHeaders });
    }

    handleRowUnitRemoveButtonClick = (key) => {
        const settings = {
            $filter: d => d.key !== key,
        };
        const newRowHeaders = update(this.state.rowHeaders, settings);

        this.setState({ rowHeaders: newRowHeaders });
    }

    handleAddRowButtonClick = () => {
        this.addRowUnit();
    }

    handleAddColumnButtonClick = () => {
        this.addColumnUnit();
    }

    addRowUnit = () => {
        const newRow = {
            key: randomString(16).toLowerCase(),
            title: '',
        };
        this.setState({
            rowHeaders: [
                ...this.state.rowHeaders,
                newRow,
            ],
        });
    }

    addColumnUnit = () => {
        const newColumn = {
            key: randomString(16).toLowerCase(),
            title: '',
        };
        this.setState({
            columnHeaders: [
                ...this.state.columnHeaders,
                newColumn,
            ],
        });
    }

    renderColHeader = (key, data) => (
        <th
            className={styles['table-header']}
            scope="col"
            key={key}
        >
            {data.title}
        </th>
    )

    renderColElement = (key, data, rowKey) => (
        <td
            className={styles['table-cell']}
            key={`${rowKey}-${key}`}
        >
            <NumberInput
                className={styles['number-input']}
                placeholder={this.props.afStrings('numberPlaceholder')}
                showLabel={false}
                showHintAndError={false}
                separator=" "
                disabled
            />
        </td>
    )

    renderRow = (key, data) => {
        const { columnHeaders } = this.state;

        return (
            <tr key={key}>
                <th
                    className={styles['table-header']}
                    scope="row"
                >
                    {data.title}
                </th>
                <List
                    data={columnHeaders}
                    modifier={(colKey, colData) => this.renderColElement(colKey, colData, key)}
                    keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                />
            </tr>
        );
    }

    renderMatrix = () => {
        const { rowHeaders, columnHeaders } = this.state;

        return (
            <table>
                <tbody>
                    <tr>
                        <td />
                        <List
                            data={columnHeaders}
                            modifier={this.renderColHeader}
                            keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                        />
                    </tr>
                    <List
                        data={rowHeaders}
                        modifier={this.renderRow}
                        keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                    />
                </tbody>
            </table>
        );
    }

    render() {
        const {
            showEditModal,
            rowHeaders,
            columnHeaders,
            title,
        } = this.state;

        const { SortableColumnList, SortableRowList } = this;

        return (
            <div styleName="number-matrix-widget">
                {this.renderMatrix(rowHeaders, columnHeaders)}
                { showEditModal &&
                    <Modal
                        styleName="edit-matrix-modal"
                        onClose={this.handleEditModalClose}
                    >
                        <ModalHeader title={this.props.afStrings('editNumberMatrixModalTitle')} />
                        <ModalBody styleName="modal-body">
                            <div styleName="general-info-container">
                                <TextInput
                                    className={styles['title-input']}
                                    label={this.props.afStrings('titleLabel')}
                                    placeholder={this.props.afStrings('titlePlaceholderScale')}
                                    onChange={this.handleWidgetTitleChange}
                                    value={title}
                                    showHintAndError={false}
                                    autoFocus
                                    selectOnFocus
                                />
                            </div>
                            <div styleName="modal-unit-container">
                                <header styleName="header">
                                    <h3 styleName="heading">
                                        {this.props.afStrings('rowsLabel')}
                                    </h3>
                                    <PrimaryButton
                                        iconName={iconNames.add}
                                        onClick={this.handleAddRowButtonClick}
                                        title={this.props.afStrings('addRowUnitButtonLabel')}
                                        transparent
                                    />
                                </header>
                                <SortableRowList
                                    items={rowHeaders}
                                    onSortEnd={this.onRowSortEnd}
                                    lockAxis="y"
                                    lockToContainerEdges
                                    useDragHandle
                                />
                            </div>
                            <div styleName="modal-unit-container">
                                <header styleName="header">
                                    <h3 styleName="heading">
                                        {this.props.afStrings('columnsLabel')}
                                    </h3>
                                    <PrimaryButton
                                        iconName={iconNames.add}
                                        onClick={this.handleAddColumnButtonClick}
                                        title={this.props.afStrings('addColumnUnitButtonLabel')}
                                        transparent
                                    />
                                </header>
                                <SortableColumnList
                                    items={columnHeaders}
                                    onSortEnd={this.onColumnSortEnd}
                                    lockAxis="y"
                                    lockToContainerEdges
                                    useDragHandle
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                onClick={this.handleModalCancelButtonClick}
                            >
                                {this.props.afStrings('cancelButtonLabel')}
                            </Button>
                            <PrimaryButton
                                onClick={this.handleModalSaveButtonClick}
                            >
                                {this.props.afStrings('saveButtonLabel')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
