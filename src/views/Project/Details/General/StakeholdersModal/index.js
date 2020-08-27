import PropTypes from 'prop-types';
import React from 'react';
import { isDefined } from '@togglecorp/fujs';
import Faram, { FaramInputElement } from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import MultiSelectInput from '#rsci/MultiSelectInput';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';

import styles from './styles.scss';

const keySelector = d => d.id;
const labelSelector = d => d.title;

const rendererParams = (key, data) => ({
    id: data.id,
    title: data.title,
});

const propTypes = {
    closeModal: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const requestOptions = {
    organizationGetRequest: {
        url: '/organizations/',
        query: { fields: ['id', 'title'] },
        method: methods.GET,
        onMount: true,
    },
};

@RequestCoordinator
@RequestClient(requestOptions)
@FaramInputElement
export default class StakeholdersModal extends React.PureComponent {
    static propTypes = propTypes;
    constructor(props) {
        super(props);

        const {
            requests: {
                organizationGetRequest,
            },
            value,
            onChange,
        } = this.props;

        this.schema = {
            fields: {
                leadOrganization: [],
                internationalPartners: [],
                donors: [],
                nationalPartners: [],
                government: [],
            },
        };

        this.state = {
            faramValues: value,
            faramErrors: {},
        };
    }


    handleChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    handleValidationSuccess = (_, faramValues) => {
        const {
            onChange,
            closeModal,
        } = this.props;
        if (isDefined(onChange)) {
            onChange(faramValues);
        }
        if (isDefined(closeModal)) {
            closeModal();
        }
    }

    handleValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
        });
    }

    render() {
        const {
            closeModal,
            requests: {
                organizationGetRequest: {
                    response,
                },
            },
        } = this.props;

        const {
            faramValues,
            faramErrors,
        } = this.state;

        const organizationResponse = response;
        const organizationList = organizationResponse
            ? organizationResponse.results
            : [];

        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
                className={styles.modal}
            >
                <Faram
                    className={styles.form}
                    onChange={this.handleChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader
                        className={styles.modalHeader}
                        title={_ts('project.details.stakeholders', 'stakeholdersModalTitle')}
                        rightComponent={(
                            <DangerButton
                                transparent
                                onClick={closeModal}
                                iconName="close"
                            />
                        )}
                    />
                    <ModalBody className={styles.modalBody}>
                        <MultiSelectInput
                            faramElementName="leadOrganization"
                            label={_ts('project.detail.stakeholders', 'leadOrganization')}
                            options={organizationList}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            rendererParams={rendererParams}
                            autoFocus
                            showLabel
                        />
                        <MultiSelectInput
                            faramElementName="internationalPartners"
                            label={_ts('project.detail.stakeholders', 'internationalPartners')}
                            options={organizationList}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            rendererParams={rendererParams}
                        />
                        <MultiSelectInput
                            faramElementName="donors"
                            label={_ts('project.detail.stakeholders', 'donors')}
                            options={organizationList}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            rendererParams={rendererParams}
                        />
                        <MultiSelectInput
                            faramElementName="nationalPartners"
                            label={_ts('project.detail.stakeholders', 'nationalPartners')}
                            options={organizationList}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            rendererParams={rendererParams}
                        />
                        <MultiSelectInput
                            faramElementName="government"
                            label={_ts('project.detail.stakeholders', 'government')}
                            options={organizationList}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            rendererParams={rendererParams}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={closeModal}
                        >
                            {_ts('project.detail.stakeholders', 'cancel')}
                        </DangerButton>
                        <SuccessButton
                            type="submit"
                        >
                            {_ts('project.detail.stakeholders', 'save')}
                        </SuccessButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
