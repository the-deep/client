import React, { useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { isDefined } from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ChecklistInput from '#rsci/ChecklistInput';
import SearchInput from '#rsci/SearchInput';

import Button from '#rsu/../v2/Action/Button';

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

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import {
    AddRequestProps,
    Requests,
    AppState,
} from '#types';

import styles from './styles.scss';

interface OwnProps {
    className?: string;
    closeModal?: () => void;
    userProjects: ProjectItem[];
    assessmentId: number;
    projectId: number;
}

interface ProjectItem {
    id: number;
    title: string;
    assessmentTemplate?: number;
}

interface PropsFromAppState {
    userProjects: ProjectItem[];
}

interface Body {
    assessments: number[];
    projects: number[];
}

interface AssessmentsByProjects {
    [key: string]: number[] | undefined;
}

interface Response {
    assessments: number[];
    projects: number[];
    assessmentsByProjects: AssessmentsByProjects;
}

interface Params {
    bodyToSendToApi: Body;
}

type ComponentPropsWithAppState = PropsFromAppState & OwnProps;

const mapStateToProps = (state: AppState) => ({
    userProjects: currentUserAdminProjectsSelector(state),
});

const requestOptions: Requests<ComponentPropsWithAppState, Params> = {
    aryCopyRequest: {
        url: '/assessment-copy/',
        body: ({ params }) => params && params.bodyToSendToApi,
        method: methods.POST,
        onSuccess: ({
            response,
            props: {
                userProjects,
                closeModal,
            },
        }) => {
            const { assessmentsByProjects } = response as Response;

            if (Object.keys(assessmentsByProjects).length > 0) {
                const successfulProjectsList = userProjects.filter(
                    p => isDefined(assessmentsByProjects[p.id]),
                ).map(p => p.title);

                const messageIfEmpty = _ts(
                    'assessments.copyModal',
                    'successMessageIfEmpty',
                );

                const message = _ts(
                    'assessments.copyModal',
                    'successNotify',
                    { projects: successfulProjectsList.join(', ') },
                );
                notify.send({
                    type: notify.type.SUCCESS,
                    title: _ts('assessments.copyModal', 'assessmentsCopyTitle'),
                    message: successfulProjectsList.length > 0 ? message : messageIfEmpty,
                    duration: notify.duration.MEDIUM,
                });
            } else {
                notify.send({
                    type: notify.type.ERROR,
                    title: _ts('assessments.copyModal', 'assessmentsCopyTitle'),
                    message: _ts('assessments.copyModal', 'errorNotify'),
                    duration: notify.duration.MEDIUM,
                });
            }

            if (closeModal) {
                closeModal();
            }
        },
        onFatal: notifyOnFatal(_ts('assessments.copyModal', 'assessmentsCopyTitle')),
        onFailure: notifyOnFailure(_ts('assessments.copyModal', '')),
        extras: {
            schemaName: 'arysCopyResponse',
        },
    },
};

type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const listKeySelector = (d: ProjectItem) => d.id;
const listLabelSelector = (d: ProjectItem) => d.title;

function AryCopyModal(props: Props) {
    const {
        className,
        closeModal,
        userProjects,
        requests: {
            aryCopyRequest,
        },
        assessmentId,
        projectId,
    } = props;

    const [
        searchText,
        setSearchText,
    ] = useState('');

    const [
        selectedProjects,
        setSelectedProjects,
    ] = useState([]);


    const handleSelectionClear = useCallback(() => {
        setSelectedProjects([]);
    }, [setSelectedProjects]);

    const selectedProjectsNo = selectedProjects.length;
    const totalProjectsNo = userProjects.length;

    const heading = `${_ts('assessments.copyModal', 'projectsLabel')} (${selectedProjectsNo}/${totalProjectsNo})`;
    const notSelected = selectedProjectsNo === 0;

    const handleExport = useCallback(() => {
        const bodyToSendToApi = {
            assessments: [assessmentId],
            projects: selectedProjects,
        };
        aryCopyRequest.do({ bodyToSendToApi });
    }, [selectedProjects, aryCopyRequest, assessmentId]);

    const filteredUserProjects = useMemo(() => (
        userProjects.filter(p => isDefined(p.assessmentTemplate) && p.id !== projectId)
    ), [projectId, userProjects]);

    const { pending } = aryCopyRequest;

    return (
        <Modal
            className={_cs(className, styles.modal)}
            onClose={closeModal}
        >
            <ModalHeader title={_ts('assessments.copyModal', 'assessmentsCopyTitle')} />
            { pending && <LoadingAnimation />}
            <ModalBody className={styles.body}>
                <header className={styles.header}>
                    <div className={styles.inputs}>
                        <SearchInput
                            className={styles.search}
                            label={_ts('assessments.copyModal', 'searchInputLabel')}
                            placeholder={_ts('assessments.copyModal', 'searchInputPlaceholder')}
                            value={searchText}
                            onChange={setSearchText}
                            showHintAndError={false}
                            autoFocus
                        />
                        <Button
                            className={styles.clear}
                            buttonType="button-danger"
                            onClick={handleSelectionClear}
                            disabled={notSelected}
                        >
                            {_ts('assessments.copyModal', 'clearSelectionButtonLabel')}
                        </Button>
                    </div>
                    <h4>
                        {heading}
                    </h4>
                </header>
                <ChecklistInput
                    className={styles.projects}
                    listClassName={styles.projectsList}
                    value={selectedProjects}
                    options={filteredUserProjects}
                    searchText={searchText}
                    onChange={setSelectedProjects}
                    keySelector={listKeySelector}
                    labelSelector={listLabelSelector}
                />
            </ModalBody>
            <ModalFooter className={styles.footer}>
                <Button
                    buttonType="button-danger"
                    onClick={closeModal}
                >
                    {_ts('assessments.copyModal', 'cancelButtonTitle')}
                </Button>
                <Button
                    buttonType="button-success"
                    type="submit"
                    disabled={notSelected}
                    onClick={handleExport}
                >
                    {_ts('assessments.copyModal', 'exportButtonTitle')}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default connect(mapStateToProps)(RequestClient(requestOptions)(AryCopyModal));
