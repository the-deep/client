import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ImageInput from '#rsci/FileInput/ImageInput';
import Label from '#rsci/Label';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import {
    projectIdFromRoute,
    setNewOrganizationAction,
} from '#redux';
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

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    addOrganizationRequest: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    organizationTypeList: PropTypes.array,
};

const defaultProps = {
    organizationTypeList: [],
};

// TODO: load organization type; don't get it from sources.organizationType
// TODO: set new organization should be injected (not by redux)
// TODO: projectId should also be injected

const idSelector = foo => foo.id;

const titleSelector = foo => foo.title;

const requests = {
    addOrganizationRequest: {
        url: '/organizations/',
        method: requestMethods.POST,
        onMount: false,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            props: {
                setNewOrganization,
                projectId,
                closeModal,
            },
            response,
        }) => {
            const newOrganization = {
                key: response.id,
                label: response.title,
                shortName: response.shortName,
                logo: response.logoUrl,
            };

            setNewOrganization({
                projectId,
                organization: newOrganization,
            });

            notify.send({
                title: 'Organization add',
                type: notify.type.SUCCESS,
                message: 'Organization added successfully.',
                duration: notify.duration.FAST,
            });
            closeModal();
        },
    },
};

const mapStateToProps = state => ({
    projectId: projectIdFromRoute(state),
});

const mapDispatchToProps = dispatch => ({
    setNewOrganization: params => dispatch(setNewOrganizationAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class AddOrganizationModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            shortName: [requiredCondition],
            // longName: [requiredCondition],
            url: [urlCondition, requiredCondition],
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

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        const { addOrganizationRequest } = this.props;
        // NOTE: adding title as long name
        const newValues = {
            ...values,
            longName: values.title,
        };

        addOrganizationRequest.do({ body: newValues });
    };

    handleImageInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: _ts('assessment.metadata.stakeholder', 'logoUploadTitle'),
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
            .preLoad(() => this.setState({ pendingLogoUpload: true }))
            .postLoad(() => this.setState({ pendingLogoUpload: false }))
            .success((response) => {
                this.setState({
                    faramValues: {
                        ...this.state.faramValues,
                        logo: response.id,
                    },
                });
            })
            .failure(() => {
                notify.send({
                    title: _ts('assessment.metadata.stakeholder', 'logoUploadTitle'),
                    type: notify.type.ERROR,
                    message: _ts('userProfile', 'logoUploadFailureMessage'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
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

        const pending = pendingLogoUpload || pendingAddOrganizationRequest;

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
                        {pendingAddOrganizationRequest &&
                            <LoadingAnimation />
                        }
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
                        {/*
                        <TextInput
                            faramElementName="longName"
                            label="Long Name"
                            placeholder="eg. United Nations Organization
                            for Coordination of Humanitarian Affairs"
                        />
                        */}
                        <TextInput
                            faramElementName="url"
                            label="URL"
                            placeholder="https://www.unicef.org"
                        />
                        <SelectInput
                            faramElementName="organizationType"
                            label="Organization Type"
                            options={organizationTypeList}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                        <Label
                            className={styles.logoTitle}
                            text="Logo"
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
                        <DangerButton onClick={closeModal} >
                            Cancel
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            pending={pending}
                            disabled={pristine}
                        >
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
