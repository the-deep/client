import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListSelection from '#rsci/ListSelection';
import SearchInput from '#rsci/SearchInput';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryConfirmButton from '#rsca/ConfirmButton/PrimaryConfirmButton';

import {
    currentUserAdminProjectsSelector,
} from '#redux';
import {
    RequestClient,
    methods,
} from '#request';

import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    leads: PropTypes.arrayOf(PropTypes.number),
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),
    closeModal: PropTypes.func,
};

const defaultProps = {
    className: '',
    leads: [],
    userProjects: [],
    closeModal: () => {},
};

const mapStateToProps = state => ({
    userProjects: currentUserAdminProjectsSelector(state),
});

const listKeySelector = d => d.id;
const listLabelSelector = d => d.title;

const requestOptions = {
    leadsCopyRequest: {
        url: '/lead-copy/',
        body: ({ params: { body } }) => body,
        method: methods.POST,
        onSuccess: ({
            response: {
                leadsByProjects,
            },
            props: {
                closeModal,
            },
        }) => {
            const projects = Object.keys(leadsByProjects);
            const leads = Object.values(leadsByProjects).flat();

            const message = _ts(
                'leads.copyModal',
                'successNotify',
                {
                    leadsCount: leads.length,
                    projectsCount: projects.length,
                },
            );

            notify.send({
                type: notify.type.SUCCESS,
                title: _ts('leads.copyModal', 'leadsCopyTitle'),
                message,
                duration: notify.duration.MEDIUM,
            });
            closeModal();
        },
        onFailure: () => {
            notify.send({
                type: notify.type.ERROR,
                title: _ts('leads.copyModal', 'leadsCopyTitle'),
                message: _ts('leads.copyModal', 'leadsCopyFailureMessage'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                type: notify.type.ERROR,
                title: _ts('leads.copyModal', 'leadsCopyTitle'),
                message: _ts('leads.copyModal', 'leadsCopyFailureMessage'),
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'leadsCopy',
        },
    },
};

@connect(mapStateToProps)
@RequestClient(requestOptions)
export default class LeadCopyModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
            selectedProjects: [],
        };
    }

    handleClearSelection = () => {
        this.setState({ selectedProjects: [] });
    }

    handleProjectListChange = (selectedProjects) => {
        this.setState({ selectedProjects });
    }

    handleSearchTextChange = (searchText) => {
        this.setState({ searchText });
    }

    handleExport = () => {
        const {
            leads,
            requests: {
                leadsCopyRequest,
            },
        } = this.props;

        const { selectedProjects: projects } = this.state;
        const body = {
            leads,
            projects,
        };
        leadsCopyRequest.do({ body });
    }

    render() {
        const {
            searchText,
            selectedProjects,
        } = this.state;

        const {
            className,
            userProjects,
            closeModal,
            leads,
            requests: {
                leadsCopyRequest: { pending },
            },
        } = this.props;

        const selectedProjectsNo = selectedProjects.length;
        const totalProjectsNo = userProjects.length;

        const confirmMessage = _ts('leads.copyModal', 'successConfirmDetail', {
            countProjects: selectedProjectsNo,
            countLeads: leads.length,
        });

        const heading = `${_ts('leads.copyModal', 'projectsLabel')} (${selectedProjectsNo}/${totalProjectsNo})`;
        const notSelected = selectedProjectsNo === 0;

        return (
            <Modal className={_cs(className, styles.leadCopyModal)} >
                <ModalHeader title={_ts('leads.copyModal', 'leadsCopyTitle')} />
                <ModalBody className={styles.body} >
                    {pending && <LoadingAnimation />}
                    <header className={styles.header} >
                        <div className={styles.inputs} >
                            <SearchInput
                                className={styles.searchInput}
                                label={_ts('leads.copyModal', 'searchInputLabel')}
                                placeholder={_ts('leads.copyModal', 'searchInputPlaceholder')}
                                value={searchText}
                                onChange={this.handleSearchTextChange}
                                showHintAndError={false}
                            />
                            <DangerButton
                                onClick={this.handleClearSelection}
                                disabled={notSelected}
                            >
                                {_ts('leads.copyModal', 'clearSelectionButtonLabel')}
                            </DangerButton>
                        </div>
                        <h4>
                            {heading}
                        </h4>
                    </header>
                    <ListSelection
                        className={styles.projects}
                        listClassName={styles.projectsList}
                        value={selectedProjects}
                        options={userProjects}
                        searchText={searchText}
                        onChange={this.handleProjectListChange}
                        keySelector={listKeySelector}
                        labelSelector={listLabelSelector}
                    />
                </ModalBody>
                <ModalFooter className={styles.footer} >
                    <DangerButton
                        onClick={closeModal}
                        disabled={pending}
                    >
                        {_ts('leads.copyModal', 'cancelButtonTitle')}
                    </DangerButton>
                    <PrimaryConfirmButton
                        confirmationMessage={confirmMessage}
                        disabled={notSelected}
                        pending={pending}
                        onClick={this.handleExport}
                    >
                        {_ts('leads.copyModal', 'exportButtonTitle')}
                    </PrimaryConfirmButton>
                </ModalFooter>
            </Modal>
        );
    }
}
