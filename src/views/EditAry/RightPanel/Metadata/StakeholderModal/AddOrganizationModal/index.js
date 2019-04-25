import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '@togglecorp/faram';


import styles from './styles.scss';

const propTypes = {
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    closeModal: () => {},
};

export default class AddOrganizationModal extends React.PureComponent {
    static schema = {
        fields: {
            title: [requiredCondition],
            shortName: [requiredCondition],
            longName: [],
            url: [],
            organizationType: [requiredCondition],
            logo: [],
        },
    };
    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: props.userInformation,
            pending: false,
            pristine: false,
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
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        const { userId } = this.props;
        this.userPatchRequest.init(userId, values).start();
    };

    // BUTTONS
    handleFaramClose = () => {
        this.props.handleModalClose();
    }
    render() {
        const {
            closeModal,
            children,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
            pending,
        } = this.state;

        return (
            <Faram
                className={styles.addOrgModal}
                onChange={this.handleFaramChange}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onValidationFailure={this.handleFaramValidationFailure}
                schema={AddOrganizationModal.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                <Modal
                    onClose={closeModal}
                    closeOnEscape
                    className={styles.modal}
                >
                    <ModalHeader title="Add Organization" />
                    <ModalBody className={styles.modalBody}>
                        <TextInput
                            label="Organization Name"
                            placeholder="eg. People In Need"
                        />
                        <TextInput
                            label="Abbreviation/Acronym"
                            placeholder="eg. UN OCHA"
                        />
                        <TextInput
                            label="Long Name"
                            placeholder="eg. United Nations Organization for Coordination of Humanitarian Affairs"
                        />
                        <TextInput
                            label="URL"
                            placeholder="www.unicef.org"
                        />
                        <SelectInput
                            label="Organization Type"
                            options={[
                                { key: 'pokhara', label: 'The Pokhara' },
                                { key: 'kathmandu', label: 'Dustmandu' },
                                { key: 'chitwan', label: 'Chitwan' },
                                { key: 'illam', label: 'Illam' },
                            ]}
                        />
                        <h4>Logo</h4>
                    </ModalBody>
                    <ModalFooter>
                        <PrimaryButton >
                            Save
                        </PrimaryButton>
                        <DangerButton
                            onClick={closeModal}
                        >
                            Close
                        </DangerButton>
                    </ModalFooter>
                </Modal>
            </Faram>
        );
    }
}
