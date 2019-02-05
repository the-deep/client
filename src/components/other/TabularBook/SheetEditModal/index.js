import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Faram, { requiredCondition } from '#rscg/Faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import FloatingContainer from '#rscv/FloatingContainer';
import { iconNames } from '#constants';
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
    };

    static defaultProps = {
        title: '',
        closeModal: () => {},
        disabled: false,
        disabledDelete: false,
    }

    constructor(props) {
        super(props);

        const { title } = this.props;

        this.state = {
            value: { title },
            error: {},
            hasError: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            value: faramValues,
            error: faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });
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

        onSheetEdit(sheetId, value);
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
                focusTrap
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
                            iconName={iconNames.trash}
                            transparent
                        />
                    </div>
                    <TextInput
                        faramElementName="title"
                        label={_ts('tabular.sheetEditModal', 'sheetNameTitle')} // Title
                        autoFocus
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

