import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ListSelection from '#rsci/ListSelection';
import FloatingContainer from '#rscv/FloatingContainer';
import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';

import _ts from '#ts';
import styles from './styles.scss';

export default class SheetRetrieveModal extends React.PureComponent {
    static propTypes = {
        closeModal: PropTypes.func,
        // eslint-disable-next-line react/forbid-prop-types
        sheets: PropTypes.array.isRequired,
        disabled: PropTypes.bool,
        onSheetRetrieve: PropTypes.func.isRequired,
    };

    static defaultProps = {
        closeModal: () => {},
        disabled: false,
    }

    static labelSelector = s => s.title;

    static keySelector = s => s.id;

    constructor(props) {
        super(props);

        this.state = {
            selectedSheets: [],
        };
    }

    handleSelection = (value) => {
        this.setState({ selectedSheets: value });
    }

    handleRetrieveClick = () => {
        const {
            onSheetRetrieve,
            closeModal,
        } = this.props;
        const { selectedSheets } = this.state;

        onSheetRetrieve(selectedSheets);
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
            sheets,
            disabled,
        } = this.props;
        const { selectedSheets } = this.state;
        return (
            <FloatingContainer
                className={styles.container}
                onInvalidate={this.handleInvalidate}
                focusTrap
            >
                <ListSelection
                    label={_ts('tabular.sheetRetrieveModal', 'sheetsLabel')} // Sheets to retrieve
                    disabled={disabled}
                    labelSelector={SheetRetrieveModal.labelSelector}
                    keySelector={SheetRetrieveModal.keySelector}
                    options={sheets}
                    value={selectedSheets}
                    onChange={this.handleSelection}
                />
                <div className={styles.actionButtons}>
                    <Button onClick={closeModal}>
                        {_ts('tabular.fieldEditModal', 'cancelFieldButtonLabel')}
                    </Button>
                    <PrimaryButton
                        disabled={disabled || selectedSheets.length <= 0}
                        onClick={this.handleRetrieveClick}
                    >
                        {_ts('tabular.sheetRetrieveModal', 'retrieveSheetButtonLabel') /* Retrieve */ }
                    </PrimaryButton>
                </div>
            </FloatingContainer>
        );
    }
}
