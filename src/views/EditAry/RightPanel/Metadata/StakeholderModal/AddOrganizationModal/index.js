import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ImageInput from '#rsci/FileInput/ImageInput';
import Checkbox from '#rsci/Checkbox';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import Faram, {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';
import _ts from '#ts';
import notify from '#notify';

import { UploadBuilder } from '#rsu/upload';
import {
    urlForUpload,
    createParamsForFileUpload,
} from '#rest';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import styles from './styles.scss';

// FIXME: Use strings everywhere, define all the props
// FIXME: No inline functions
// FIXME: Donot define props inline in image input

const propTypes = {
};

const defaultProps = {
};

const requests = {
    addOrganizationRequest: {
        url: '/organizations/',
        method: requestMethods.POST,
        onMount: false,
        body: ({ params: { body } }) => body,
    },
};

@RequestCoordinator
@RequestClient(requests)
export default class AddOrganizationModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            shortName: [requiredCondition],
            longName: [requiredCondition],
            url: [urlCondition],
            organizationType: [requiredCondition],
            logo: [],
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pristine: true,
            pendingLogoUpload: false,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleAddOrganizationRequestSuccess = () => {
        console.warn('woo hooo');
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        const { addOrganizationRequest } = this.props;
        addOrganizationRequest.do({
            body: values,
            onSuccess: this.handleAddOrganizationRequestSuccess,
        });
    };

    handleImageInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: _ts('assessment.metadata.stakeholder', 'logoSelection'),
                type: notify.type.WARNING,
                message: _ts('assessment.metadata.stakeholder', 'invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        const file = files[0];

        if (this.logoUploader) {
            this.logoUploader.stop();
        }

        this.logoUploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload({ is_public: true }))
            .preLoad(() => this.setState({ logoUploadPending: true }))
            .postLoad(() => this.setState({ logoUploadPending: false }))
            .success((response) => {
                console.warn('woooo hooo', response.id);
                this.setState({
                    ...this.state.faramValues,
                    logo: response.id,
                });
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: _ts('assessment.metadata.stakeholder', 'logoUploadTitle'),
                    type: notify.type.ERROR,
                    message: _ts('userProfile', 'logoUploadFailureMessage'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: _ts('assessment.metadata.stakeholder', 'logoUploadTitle'),
                    type: notify.type.ERROR,
                    message: _ts('userProfile', 'logoUploadFailureMessage'),
                    duration: notify.duration.SLOW,
                });
            })
            .build();

        this.logoUploader.start();
    }
    render() {
        const {
            closeModal,
            children,
            organizationTypeList,
            addOrganizationRequest: {
                pending: pendingAddOrganizationRequest,
            },
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
            pendingLogoUpload,
        } = this.state;

        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
                className={styles.modal}
            >
                <Faram
                    className={styles.addOrgModal}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={AddOrganizationModal.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pendingAddOrganizationRequest}
                >
                    <ModalHeader title="Add Organization" />
                    <ModalBody className={styles.modalBody}>
                        <TextInput
                            faramElementName="title"
                            label="Organization Name"
                            placeholder="eg. People In Need"
                        />
                        <TextInput
                            faramElementName="shortName"
                            label="Abbreviation/Acronym"
                            placeholder="eg. UN OCHA"
                        />
                        <TextInput
                            faramElementName="longName"
                            label="Long Name"
                            placeholder="eg. United Nations Organization for Coordination of Humanitarian Affairs"
                        />
                        <TextInput
                            faramElementName="url"
                            label="URL"
                            placeholder="www.unicef.org"
                        />
                        <SelectInput
                            faramElementName="organizationType"
                            label="Organization Type"
                            options={organizationTypeList}
                            keySelector={d => d.id}
                            labelSelector={d => d.title}
                        />
                        <Checkbox
                            faramElementName="donor"
                            label="Donor"
                        />
                        <ImageInput
                            className={styles.imageInput}
                            showPreview
                            showStatus={false}
                            accept="image/png, image/jpeg, image/fig, image/gif"
                            onChange={this.handleImageInputChange}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={closeModal}
                            disable={pendingLogoUpload}
                        >
                            Cancel
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disable={pendingLogoUpload}
                        >
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
