import PropTypes from 'prop-types';
import React from 'react';
import {
    listToGroupList,
    isDefined,
    isFalsyString,
    unique,
} from '@togglecorp/fujs';
import Faram, { FaramInputElement } from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';

import SearchOrganization from './SearchOrganization';
import OrganizationField from './OrganizationField';
import styles from './styles.scss';


const organizationKeySelector = d => d.id;
const organizationLabelSelector = d => d.title;
const fieldKeySelector = d => d.faramElementName;

const propTypes = {
    closeModal: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    fields: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const requestOptions = {
    organizationsGetRequest: {
        url: '/organizations/',
        query: ({ params }) => ({
            search: params && params.searchText,
        }),
        method: methods.GET,
        onSuccess: ({ response: { results = [] }, params }) => {
            if (params && params.handleSuccess) {
                const { handleSuccess } = params;
                handleSuccess(results);
            }
        },
        options: {
            delay: 300,
        },
    },
};

const transformOrganizationToOptions = (organizations = []) => (
    organizations.map(({ id, organization, ...others }) => (
        { ...others, id: organization, projectOrganizationId: id }
    ))
);

const transformOrganizationToFaramValues = (organizations = []) => (
    listToGroupList(organizations, o => o.type, o => o.organization)
);

const transformFaramValuesToOrganization = (faramValues = {}, options = []) => {
    let organizations = [];
    Object.entries(faramValues).forEach(([key, values]) => {
        const organizationList = values
            .map(v => options.find(o => o.id === v))
            .filter(isDefined)
            .map(({ id, title, projectOrganizationId }) => ({
                organization: id,
                type: key,
                title,
                id: projectOrganizationId,
            }));

        organizations = [...organizations, ...organizationList];
    });
    return organizations;
};

@RequestCoordinator
@RequestClient(requestOptions)
@FaramInputElement
export default class StakeholdersModal extends React.PureComponent {
    static propTypes = propTypes;
    constructor(props) {
        super(props);

        const {
            value,
        } = this.props;

        this.schema = {
            fields: {
                lead_organization: [],
                international_partner: [],
                national_partner: [],
                donor: [],
                government: [],
            },
        };

        this.state = {
            searchOptions: [],
            organizationOptions: transformOrganizationToOptions(value),
            faramValues: transformOrganizationToFaramValues(value),
            faramErrors: {},
        };
    }

    setOrganizationList = (newOptions) => {
        const { organizationOptions } = this.state;
        const uniqueOptions = unique(
            [
                ...newOptions,
                ...organizationOptions,

            ].filter(isDefined),
            option => option.id,
        );
        this.setState({
            searchOptions: newOptions,
            organizationOptions: uniqueOptions,
        });
    }

    organizationFieldRenderParams = (_, data) => {
        const { organizationOptions } = this.state;
        return {
            ...data,
            options: organizationOptions,
            keySelector: organizationKeySelector,
            labelSelector: organizationLabelSelector,
            containerClassName: styles.widgetContainer,
            className: styles.widget,
            itemClassName: styles.widgetItem,
            showHintAndError: false,
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
        const { organizationOptions } = this.state;
        const transformedValues = transformFaramValuesToOrganization(
            faramValues,
            organizationOptions,
        );

        if (isDefined(onChange)) {
            onChange(transformedValues);
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

    handleSearch = (searchText) => {
        const {
            requests: {
                organizationsGetRequest,
            },
        } = this.props;
        if (isFalsyString(searchText)) {
            organizationsGetRequest.abort();
            this.setState({
                searchOptions: [],
            });
        } else {
            organizationsGetRequest.do({
                searchText,
                handleSuccess: this.setOrganizationList,
            });
        }
    }

    render() {
        const {
            closeModal,
            requests: {
                organizationsGetRequest: {
                    pending,
                },
            },
            fields,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            searchOptions,
        } = this.state;

        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
                className={styles.modal}
            >
                <ModalHeader
                    title={_ts('project.detail.stakeholders', 'stakeholdersModalTitle')}
                />
                <Faram
                    className={styles.faram}
                    onChange={this.handleChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalBody className={styles.modalBody}>
                        <SearchOrganization
                            className={styles.organizationList}
                            organizationList={searchOptions}
                            handleSearch={this.handleSearch}
                            pending={pending}
                        />
                        <div className={styles.right}>
                            <ListView
                                className={styles.widgetList}
                                data={fields}
                                keySelector={fieldKeySelector}
                                renderer={OrganizationField}
                                rendererParams={this.organizationFieldRenderParams}
                            />
                        </div>
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
