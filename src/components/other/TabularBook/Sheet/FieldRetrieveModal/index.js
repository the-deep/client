import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ListSelection from '#rsci/ListSelection';

import _ts from '#ts';

export default class FieldRetrieveModal extends React.PureComponent {
    static propTypes = {
        closeModal: PropTypes.func,
        // eslint-disable-next-line react/forbid-prop-types
        fields: PropTypes.array.isRequired,
        disabled: PropTypes.bool,
        onFieldRetrieve: PropTypes.func.isRequired,
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
            selectedFields: [],
        };
    }

    handleSelection = (value) => {
        this.setState({ selectedFields: value });
    }

    handleRetrieveClick = () => {
        const {
            onFieldRetrieve,
            closeModal,
        } = this.props;
        const { selectedFields } = this.state;

        onFieldRetrieve(selectedFields);
        closeModal();
    }

    render() {
        const { closeModal, fields, disabled } = this.props;
        const { selectedFields } = this.state;
        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
            >
                <ModalBody>
                    <ListSelection
                        label={_ts('tabular.fieldRetrieveModal', 'fieldsLabel')} // Fields to retrieve
                        disabled={disabled}
                        labelSelector={FieldRetrieveModal.labelSelector}
                        keySelector={FieldRetrieveModal.keySelector}
                        options={fields}
                        value={this.state.selectedFields}
                        onChange={this.handleSelection}

                    />
                    <PrimaryButton
                        disabled={disabled || selectedFields.length <= 0}
                        onClick={this.handleRetrieveClick}
                    >
                        {_ts('tabular.fieldRetrieveModal', 'retrieveFieldButtonLabel') /* Retrieve */ }
                    </PrimaryButton>
                </ModalBody>
            </Modal>
        );
    }
}
