import PropTypes from 'prop-types';
import React from 'react';
import {
    isNotDefined,
} from '@togglecorp/fujs';
import Faram, {
    requiredCondition,
    greaterThanCondition,
    lessThanOrEqualToCondition,
    integerCondition,
} from '@togglecorp/faram';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import Checkbox from '#rsci/Checkbox';
import TextInput from '#rsci/TextInput';
import NumberInput from '#rsci/NumberInput';
import FloatingContainer from '#rscv/FloatingContainer';
import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';

import _ts from '#ts';
import styles from './styles.scss';

export default class SheetEditModal extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        onSheetEdit: PropTypes.func.isRequired,
        onSheetDelete: PropTypes.func.isRequired,
        sheetId: PropTypes.number.isRequired,
        closeModal: PropTypes.func,
        disabled: PropTypes.bool,
        disabledDelete: PropTypes.bool,
        dataRowIndex: PropTypes.number,
        dataRowCount: PropTypes.number,
    };

    static defaultProps = {
        title: '',
        closeModal: () => {},
        disabled: false,
        disabledDelete: false,
        dataRowIndex: undefined,
        dataRowCount: undefined,
    }

    constructor(props) {
        super(props);

        const {
            title,
            dataRowIndex,
            dataRowCount,
        } = this.props;

        this.state = {
            value: {
                title,
                dataRowIndex: dataRowIndex === 0 ? undefined : dataRowIndex,
                hasNoHeaderRow: dataRowIndex === 0,
            },
            error: {},
            hasError: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                // dataRowIndex = User input
                // - 1 because user uses one-indexing
                // + 1 because dataRowIndex is one greater than header row index
                hasNoHeaderRow: [],
                dataRowIndex: [
                    requiredCondition,
                    integerCondition,
                    greaterThanCondition(0),
                    lessThanOrEqualToCondition(dataRowCount),
                ],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        const { dataRowIndex } = this.state.value;
        // NOTE: if no header is selected and data row index is no set, set it to 1
        // so that there will not be any 'isRequired' error
        if (
            (isNotDefined(dataRowIndex) || this.state.error.dataRowIndex)
            && faramValues.hasNoHeaderRow
        ) {
            this.setState({
                value: {
                    ...faramValues,
                    dataRowIndex: 1,
                },
                error: {
                    ...faramErrors,
                    dataRowIndex: undefined,
                },
                pristine: false,
                // TODO: calculate error here better way
                hasError: false, // faramInfo.hasError,
            });
        } else {
            this.setState({
                value: faramValues,
                error: faramErrors,
                pristine: false,
                hasError: faramInfo.hasError,
            });
        }
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ error: faramErrors });
    };

    handleFaramValidationSuccess = (value) => {
        const {
            onSheetEdit,
            sheetId,
            closeModal,
        } = this.props;

        const {
            dataRowIndex,
            hasNoHeaderRow,
            ...otherValue
        } = value;

        const newValue = {
            ...otherValue,
            dataRowIndex: hasNoHeaderRow ? 0 : dataRowIndex,
        };

        onSheetEdit(sheetId, newValue);
        closeModal();
    };

    handleDeleteClick = () => {
        const {
            onSheetDelete,
            sheetId,
            closeModal,
        } = this.props;

        onSheetDelete(sheetId);
        closeModal();
    }

    handleInvalidate = (container) => {
        // Note: pass through prop
        // eslint-disable-next-line react/prop-types
        const { parentBCR } = this.props;

        const contentRect = container.getBoundingClientRect();

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect: parentBCR,
                contentRect,
                defaultOffset,
                limit: {
                    ...defaultLimit,
                    minW: 240,
                    maxW: 360,
                },
            })
        );

        return optionsContainerPosition;
    }

    render() {
        const {
            closeModal,
            disabled,
            disabledDelete,
        } = this.props;

        const {
            value,
            error,
            hasError,
            pristine,
        } = this.state;

        return (
            <FloatingContainer
                className={styles.container}
                onInvalidate={this.handleInvalidate}
                closeOnEscape
                onClose={closeModal}
                focusTrap
                showHaze
            >
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}

                    schema={this.schema}
                    value={value}
                    error={error}
                    disabled={disabled}
                >
                    <div className={styles.top}>
                        <NonFieldErrors
                            faramElement
                            className={styles.nonFieldErrors}
                        />
                        <DangerButton
                            className={styles.removeSheetButton}
                            disabled={disabled || disabledDelete}
                            onClick={this.handleDeleteClick}
                            title={_ts('tabular.sheetEditModal', 'deleteSheetButtonLabel')}
                            iconName="trash"
                            transparent
                        />
                    </div>
                    <TextInput
                        faramElementName="title"
                        label={_ts('tabular.sheetEditModal', 'sheetNameTitle')} // Title
                        autoFocus
                    />
                    <NumberInput
                        faramElementName="dataRowIndex"
                        label={_ts('tabular.sheetEditModal', 'sheetDataRowIndexTitle')}
                        separator=" "
                        disabled={value.hasNoHeaderRow}
                    />
                    <Checkbox
                        faramElementName="hasNoHeaderRow"
                        label={_ts('tabular.sheetEditModal', 'hasNoHeaderTitle')}
                    />
                    <div className={styles.actionButtons}>
                        <Button onClick={closeModal}>
                            {_ts('tabular.fieldEditModal', 'cancelFieldButtonLabel')}
                        </Button>
                        <PrimaryButton
                            type="submit"
                            disabled={disabled || hasError || pristine}
                        >
                            {_ts('tabular.sheetEditModal', 'saveSheetButtonLabel') /* Save Sheet */ }
                        </PrimaryButton>
                    </div>
                </Faram>
            </FloatingContainer>
        );
    }
}

