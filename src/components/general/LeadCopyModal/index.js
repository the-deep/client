import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ListSelection from '#rsci/ListSelection';
import TextInput from '#rsci/TextInput';

import DangerButton from '#rsca/Button/DangerButton';
import SuccessConfirmButton from '#rsca/ConfirmButton/SuccessConfirmButton';

import {
    currentUserAdminProjectsSelector,
} from '#redux';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    leads: PropTypes.arrayOf(PropTypes.number),
    leadsCopyRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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
    leadsCopyRequest: {},
};

const mapStateToProps = state => ({
    userProjects: currentUserAdminProjectsSelector(state),
});

const listKeySelector = d => d.id;
const listLabelSelector = d => d.title;

const requests = {
    leadsCopyRequest: {
        url: '/leads-copy/',
        body: ({ params: { body } }) => body,
        method: requestMethods.POST,
        onSuccess: ({ response: { leads, projects } }) => {
            const message = _ts(
                'leads.copyModal',
                'successNotify',
                {
                    leadsCount: leads.count,
                    projectsCount: projects.count,
                },
            );

            notify.send({
                type: notify.type.SUCCESS,
                title: _ts('leads.copyModal', 'leadsCopyTitle'),
                message,
                duration: notify.duration.MEDIUM,
            });
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
        schemaName: 'leadsCopy',
    },
};

@connect(mapStateToProps)
@RequestCoordinator
@RequestClient(requests)
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
            leadsCopyRequest,
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
            leadsCopyRequest: { pending },
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
                    <header className={styles.header} >
                        <h4>
                            {heading}
                        </h4>
                        <DangerButton
                            onClick={this.handleClearSelection}
                            disabled={notSelected}
                        >
                            {_ts('leads.copyModal', 'clearSelectionButtonLabel')}
                        </DangerButton>
                    </header>
                    <div className={styles.inputs} >
                        <TextInput
                            label={_ts('leads.copyModal', 'searchInputLabel')}
                            placeholder={_ts('leads.copyModal', 'searchInputPlaceholder')}
                            value={searchText}
                            onChange={this.handleSearchTextChange}
                            showHintAndError={false}
                        />
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
                    </div>
                </ModalBody>
                <ModalFooter className={styles.footer} >
                    <DangerButton
                        onClick={closeModal}
                        pending={pending}
                    >
                        {_ts('leads.copyModal', 'cancelButtonTitle')}
                    </DangerButton>
                    <SuccessConfirmButton
                        confirmationMessage={confirmMessage}
                        disabled={notSelected || pending}
                        onClick={this.handleExport}
                    >
                        {_ts('leads.copyModal', 'exportButtonTitle')}
                    </SuccessConfirmButton>
                </ModalFooter>
            </Modal>
        );
    }
}
