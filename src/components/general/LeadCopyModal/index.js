import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ChecklistInput from '#rsci/ChecklistInput';
import SearchInput from '#rsci/SearchInput';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryConfirmButton from '#rsca/ConfirmButton/PrimaryConfirmButton';

import {
    currentUserAdminProjectsSelector,
    projectIdFromRouteSelector,
} from '#redux';
import {
    RequestClient,
    methods,
} from '#request';

import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const mapStateToProps = state => ({
    userProjects: currentUserAdminProjectsSelector(state),
    currentProject: projectIdFromRouteSelector(state),
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
                onSuccess,
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
            if (onSuccess) {
                onSuccess();
            }
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

function LeadCopyModal(props) {
    const {
        className,
        userProjects,
        closeModal,
        leads,
        currentProject,
        requests: {
            leadsCopyRequest: {
                pending: leadsCopyPending,
                do: leadsCopyRequestTrigger,
            },
        },
    } = props;

    const [searchText, setSearchText] = useState('');
    const [selectedProjects, setSelectedProjects] = useState([]);

    const handleClearSelection = useCallback(() => {
        setSelectedProjects([]);
    }, [setSelectedProjects]);

    const handleExport = useCallback(() => {
        const body = {
            leads,
            projects: selectedProjects,
        };
        leadsCopyRequestTrigger({ body });
    }, [
        leads,
        leadsCopyRequestTrigger,
        selectedProjects,
    ]);

    const selectedProjectsNo = selectedProjects.length;
    const totalProjectsNo = userProjects.length;

    const confirmMessage = _ts('leads.copyModal', 'successConfirmDetail', {
        countProjects: selectedProjectsNo,
        countLeads: leads.length,
    });

    const filteredProjects = useMemo(() => (
        userProjects.filter(u => u.id !== currentProject)
    ), [userProjects, currentProject]);

    const heading = `${_ts('leads.copyModal', 'projectsLabel')} (${selectedProjectsNo}/${totalProjectsNo})`;
    const notSelected = selectedProjectsNo === 0;

    return (
        <Modal className={_cs(className, styles.leadCopyModal)} >
            <ModalHeader title={_ts('leads.copyModal', 'leadsCopyTitle')} />
            <ModalBody className={styles.body} >
                {leadsCopyPending && <LoadingAnimation />}
                <header className={styles.header} >
                    <div className={styles.inputs} >
                        <SearchInput
                            className={styles.searchInput}
                            label={_ts('leads.copyModal', 'searchInputLabel')}
                            placeholder={_ts('leads.copyModal', 'searchInputPlaceholder')}
                            value={searchText}
                            onChange={setSearchText}
                            showHintAndError={false}
                        />
                        <DangerButton
                            onClick={handleClearSelection}
                            disabled={notSelected}
                        >
                            {_ts('leads.copyModal', 'clearSelectionButtonLabel')}
                        </DangerButton>
                    </div>
                    <h4>
                        {heading}
                    </h4>
                </header>
                <ChecklistInput
                    className={styles.projects}
                    listClassName={styles.projectsList}
                    value={selectedProjects}
                    options={filteredProjects}
                    searchText={searchText}
                    onChange={setSelectedProjects}
                    keySelector={listKeySelector}
                    labelSelector={listLabelSelector}
                />
            </ModalBody>
            <ModalFooter className={styles.footer} >
                <DangerButton
                    onClick={closeModal}
                >
                    {_ts('leads.copyModal', 'cancelButtonTitle')}
                </DangerButton>
                <PrimaryConfirmButton
                    confirmationMessage={confirmMessage}
                    disabled={notSelected}
                    pending={leadsCopyPending}
                    onClick={handleExport}
                >
                    {_ts('leads.copyModal', 'exportButtonTitle')}
                </PrimaryConfirmButton>
            </ModalFooter>
        </Modal>
    );
}

LeadCopyModal.propTypes = {
    className: PropTypes.string,
    currentProject: PropTypes.number.isRequired,
    leads: PropTypes.arrayOf(PropTypes.number),
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),
    closeModal: PropTypes.func,
    onSuccess: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
};

LeadCopyModal.defaultProps = {
    className: undefined,
    leads: [],
    userProjects: [],
    closeModal: undefined,
    onSuccess: undefined,
};

export default connect(mapStateToProps)(RequestClient(requestOptions)(LeadCopyModal));
