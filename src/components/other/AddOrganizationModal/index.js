import PropTypes from 'prop-types';
import React from 'react';
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
    title: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    addOrganizationRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    organizationTypesRequest: PropTypes.object.isRequired,

    closeModal: PropTypes.func.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    onOrganizationAdd: PropTypes.func.isRequired,
    loadOrganizationList: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    organizationTypeList: PropTypes.array,
};

const defaultProps = {
    // FIXME: Use strings
    title: 'Add Organization',
    organizationTypeList: [],
    loadOrganizationList: false,
};

const idSelector = item => item.id;

const titleSelector = item => item.title;

const requests = {
    organizationTypesRequest: {
        url: '/organization-types/',
        method: requestMethods.GET,
        onMount: ({ props }) => props.loadOrganizationList,
    },
    addOrganizationRequest: {
        url: '/organizations/',
        method: requestMethods.POST,
        onMount: false,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            props: {
                onOrganizationAdd,
                closeModal,
            },
            response,
        }) => {
            onOrganizationAdd(response);

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
            organizationTypeList: organizationTypeListFromProps,
            addOrganizationRequest: {
                pending: pendingAddOrganizationRequest,
            },
            organizationTypesRequest: {
                pending: pendingOrganizationTypesRequest,
                response: {
                    results: organizationTypeListFromResponse,
                } = {},
            } = {},
            loadOrganizationList,
            title,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
            pendingLogoUpload,
        } = this.state;

        const pending = (
            pendingLogoUpload
            || pendingAddOrganizationRequest
            || (loadOrganizationList && pendingOrganizationTypesRequest)
        );

        const organizationTypeList = loadOrganizationList
            ? organizationTypeListFromResponse
            : organizationTypeListFromProps;

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
                    <ModalHeader title={title} />
                    <ModalBody className={styles.modalBody}>
                        {pendingAddOrganizationRequest &&
                            <LoadingAnimation />
                        }
                        <TextInput
                            faramElementName="title"
                            label={_ts('organization.addModal', 'nameLabel')}
                            placeholder={_ts('organization.addModal', 'namePlaceholder')}
                        />
                        <TextInput
                            faramElementName="shortName"
                            label={_ts('organization.addModal', 'acronymLabel')}
                            placeholder={_ts('organization.addModal', 'acronymPlaceholder')}
                        />
                        {/*
                        <TextInput
                            faramElementName="longName"
                            label="Long Name"
                            placeholder="eg. United Nations Organization
                            for Coordination of Humanitarian Affairs"
                        />
                        */}
                        <SelectInput
                            faramElementName="organizationType"
                            label={_ts('organization.addModal', 'organizationTypeLabel')}
                            options={organizationTypeList}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                        <TextInput
                            faramElementName="url"
                            label={_ts('organization.addModal', 'urlLabel')}
                            placeholder={_ts('organization.addModal', 'urlPlaceholder')}
                        />
                        <Label
                            className={styles.logoTitle}
                            text={_ts('organization.addModal', 'logoLabel')}
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
                            {_ts('organization.addModal', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            pending={pending}
                            disabled={pristine}
                        >
                            {_ts('organization.addModal', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
