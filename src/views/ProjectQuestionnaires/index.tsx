import React from 'react';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';
import memoize from 'memoize-one';

import Page from '#rscv/Page';
import VerticalTabs from '#rscv/VerticalTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';

import QuestionnaireForm from '#qbc/QuestionnaireForm';
import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import {
    QuestionnaireElement,
    AddRequestProps,
    Requests,
} from '#typings';

import {
    RequestCoordinator,
    RequestClient,
    methods,
    getResults,
} from '#request';

import QuestionnaireList from './QuestionnaireList';


import styles from './styles.scss';


interface ComponentProps {
    className?: string;
    activeProjectId: number;
    projectName: string;
    frameworkName: string;
}

interface State {
    showEditQuestionnaireModal: boolean;
}

type TabElement = 'active' | 'archived';

interface Params {
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireRequest: {
        url: '/questionnaires/',
        method: methods.GET,
        onMount: true,
    },
};

const getHashFromBrowser = () => window.location.hash.substr(2);

class ProjectQuestionnaires extends React.PureComponent<Props, State> {
    public state = {
        showEditQuestionnaireModal: false,
    }

    private getQuestionnaireListForCurrentView = () => {
        const { requests } = this.props;

        const questionnaireList = getResults(requests, 'questionnaireRequest') as QuestionnaireElement[];
        const currentView = getHashFromBrowser();

        if (currentView === 'active') {
            return questionnaireList.filter(q => !q.isArchived);
        }

        if (currentView === 'archived') {
            return questionnaireList.filter(q => q.isArchived);
        }

        return [];
    }

    private getQuestionnaireCounts = memoize((questionnaireList: QuestionnaireElement[]) => ({
        active: questionnaireList.filter(q => !q.isArchived).length,
        archived: questionnaireList.filter(q => q.isArchived).length,
    }))

    private getFrameworkName = (questionnaireList) => {
        if (!questionnaireList || questionnaireList.length === 0) {
            return '';
        }

        const firstQuestionnaire = questionnaireList[0];

        if (!firstQuestionnaire.projectFrameworkDetail) {
            return '';
        }

        return firstQuestionnaire.projectFrameworkDetail.title;
    }


    private handleAddQuestionnaireButtonClick = () => {
        this.setState({ showEditQuestionnaireModal: true });
    }

    private handleCloseEditQuestionnaireModalButton = () => {
        this.setState({ showEditQuestionnaireModal: false });
    }

    private tabs: {[key in TabElement]: string} = {
        active: 'Active',
        archived: 'Archived',
    };

    private views = {
        active: {
            component: QuestionnaireList,
            rendererParams: () => ({
                title: 'Active questionnaires',
                questionnaireList: this.getQuestionnaireListForCurrentView(),
            }),
        },
        archived: {
            component: QuestionnaireList,
            rendererParams: () => ({
                title: 'Archived questionnaires',
                questionnaireList: this.getQuestionnaireListForCurrentView(),
            }),
        },
    }

    public render() {
        const {
            className,
            activeProjectId: projectId,
            projectName,
            requests,
        } = this.props;

        const { showEditQuestionnaireModal } = this.state;

        const questionnaireList = getResults(requests, 'questionnaireRequest') as QuestionnaireElement[];
        const questionnaireCounts = this.getQuestionnaireCounts(questionnaireList);
        const frameworkName = this.getFrameworkName(questionnaireList);

        return (
            <>
                <Page
                    className={_cs(styles.projectQuestionnaires, className)}
                    mainContentClassName={styles.main}
                    headerAboveSidebar
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <div className={styles.projectDetails}>
                                <h3 className={styles.heading}>
                                    Project
                                </h3>
                                <div className={styles.content}>
                                    <div className={styles.projectName}>
                                        { projectName }
                                    </div>
                                    <div className={styles.frameworkName}>
                                        <div className={styles.label}>
                                            Analysis framework
                                        </div>
                                        <div className={styles.value}>
                                            { frameworkName }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.questionnaires}>
                                <h3 className={styles.heading}>
                                    Questionnaires
                                </h3>
                                <div className={styles.content}>
                                    <VerticalTabs
                                        tabs={this.tabs}
                                        useHash
                                        modifier={(itemKey: TabElement) => (
                                            <div className={styles.tab}>
                                                <div className={styles.label}>
                                                    { this.tabs[itemKey] }
                                                </div>
                                                <div className={styles.count}>
                                                    { questionnaireCounts[itemKey] }
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <Button
                                    onClick={this.handleAddQuestionnaireButtonClick}
                                >
                                    New questionnaire
                                </Button>
                            </div>
                        </>
                    )}
                    mainContent={(
                        <MultiViewContainer
                            views={this.views}
                            useHash
                        />
                    )}
                    headerClassName={styles.header}
                    header={(
                        <>
                            <BackLink
                                className={styles.backLink}
                                defaultLink={reverseRoute(pathNames.projects, { projectId })}
                            />
                            <h2 className={styles.heading}>
                                Project questionnaires
                            </h2>
                        </>
                    )}
                />
                {showEditQuestionnaireModal && (
                    <Modal className={styles.editQuestionnaireModal}>
                        <ModalHeader
                            title="Edit questionnaire details"
                            rightComponent={
                                <Button
                                    iconName="close"
                                    onClick={this.handleCloseEditQuestionnaireModalButton}
                                />
                            }
                        />
                        <ModalBody>
                            <QuestionnaireForm
                                projectId={projectId}
                            />
                        </ModalBody>
                    </Modal>
                )}
            </>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requestOptions)(
        ProjectQuestionnaires,
    ),
);
