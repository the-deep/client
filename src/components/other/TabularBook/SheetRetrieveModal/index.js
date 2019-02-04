import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ListSelection from '#rsci/ListSelection';

import _ts from '#ts';

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

    render() {
        const {
            closeModal,
            sheets,
            disabled,
        } = this.props;
        const { selectedSheets } = this.state;
        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
            >
                <ModalBody>
                    <ListSelection
                        label={_ts('tabular.sheetRetrieveModal', 'sheetsLabel')} // Sheets to retrieve
                        disabled={disabled}
                        labelSelector={SheetRetrieveModal.labelSelector}
                        keySelector={SheetRetrieveModal.keySelector}
                        options={sheets}
                        value={selectedSheets}
                        onChange={this.handleSelection}
                    />
                    <PrimaryButton
                        disabled={disabled || selectedSheets.length <= 0}
                        onClick={this.handleRetrieveClick}
                    >
                        {_ts('tabular.sheetRetrieveModal', 'retrieveSheetButtonLabel') /* Retrieve */ }
                    </PrimaryButton>
                </ModalBody>
            </Modal>
        );
    }
}
