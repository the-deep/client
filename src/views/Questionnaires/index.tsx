import React from 'react';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';
import { connect } from 'react-redux';

import MultiViewContainer from '#rscv/MultiViewContainer';
import Page from '#rscv/Page';
import VerticalTabs from '#rscv/VerticalTabs';

import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';
import {
    projectIdFromRouteSelector,
    projectDetailsSelector,
} from '#redux';

import {
    ProjectElement,
    ViewComponent,

    AddRequestProps,
    AppState,
    Requests,
} from '#types';

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';
import _ts from '#ts';

import QuestionnaireList from './QuestionnaireList';

import styles from './styles.scss';

interface QuestionnaireMeta {
    archivedCount: number;
    activeCount: number;
    analysisFramework?: {
        id: number;
        title: string;
    };
}

type TabElement = 'active' | 'archived';

const tabs: {[key in TabElement]: string} = {
    active: _ts('project.questionnaire', 'activeTabTitle'),
    archived: _ts('project.questionnaire', 'archivedTabTitle'),
};

interface ComponentProps {
    className?: string;
    projectId: number;
    projectDetail: ProjectElement;
}

interface State {
    currentPageForActiveTab: number;
    currentPageForArchivedTab: number;
    questionnaireMeta?: QuestionnaireMeta;
}

const mapStateToProps = (state: AppState) => ({
    projectDetail: projectDetailsSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

interface Params {
    setQuestionnaireMeta?: (questionnaireMeta: QuestionnaireMeta) => void;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireMetaRequest: {
        url: ({ props }) => `/projects/${props.projectId}/questionnaire-meta/`,
        onPropsChanged: ['projectId'],
        method: methods.GET,
        onMount: true,
        onSuccess: ({ response, params }) => {
            if (!params || !params.setQuestionnaireMeta) {
                return;
            }
            const questionnaireMeta = response as QuestionnaireMeta;
            params.setQuestionnaireMeta(questionnaireMeta);
        },
        onFailure: notifyOnFailure('Questionnaire Metadata'),
        onFatal: notifyOnFatal('Questionnaire Metadata'),
    },
};

class Questionnaires extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        // NOTE: may need to save this in redux
        this.state = {
            currentPageForActiveTab: 1,
            currentPageForArchivedTab: 1,
            questionnaireMeta: undefined,
        };
        this.props.requests.questionnaireMetaRequest.setDefaultParams({
            setQuestionnaireMeta: (questionnaireMeta: QuestionnaireMeta) => {
                this.setState({ questionnaireMeta });
            },
        });

        this.views = {
            active: {
                component: QuestionnaireList,
                rendererParams: () => ({
                    title: _ts('project.questionnaire', 'activeQuestionnairePageHeader'),
                    className: styles.content,
                    projectId: this.props.projectId,
                    onQuestionnaireMetaReload: this.props.requests.questionnaireMetaRequest.do,
                    archived: false,
                    activePage: this.state.currentPageForActiveTab,
                    onActivePageChange: this.handleCurrentPageChangeForActiveTab,
                }),
            },
            archived: {
                component: QuestionnaireList,
                rendererParams: () => ({
                    title: _ts('project.questionnaire', 'archivedQuestionnairePageHeader'),
                    className: styles.content,
                    projectId: this.props.projectId,
                    archived: true,
                    onQuestionnaireMetaReload: this.props.requests.questionnaireMetaRequest.do,
                    activePage: this.state.currentPageForArchivedTab,
                    onActivePageChange: this.handleCurrentPageChangeForArchivedTab,
                }),
            },
        };
    }

    private views: {
        active: ViewComponent<React.ComponentProps<typeof QuestionnaireList>>;
        archived: ViewComponent<React.ComponentProps<typeof QuestionnaireList>>;
    }

    private handleCurrentPageChangeForActiveTab = (page: number) => {
        this.setState({ currentPageForActiveTab: page });
    }

    private handleCurrentPageChangeForArchivedTab = (page: number) => {
        this.setState({ currentPageForArchivedTab: page });
    }

    private tabsModifier = (itemKey: TabElement) => {
        const { questionnaireMeta } = this.state;

        const counts: {[key in TabElement]: number} = {
            active: questionnaireMeta ? questionnaireMeta.activeCount : 0,
            archived: questionnaireMeta ? questionnaireMeta.archivedCount : 0,
        };

        return (
            <div className={styles.tab}>
                <div className={styles.label}>
                    { tabs[itemKey] }
                </div>
                <div className={styles.count}>
                    { counts[itemKey] }
                </div>
            </div>
        );
    }

    public render() {
        const {
            className,
            projectId,
            projectDetail,
        } = this.props;
        const {
            questionnaireMeta,
        } = this.state;

        const frameworkName = questionnaireMeta && questionnaireMeta.analysisFramework
            ? questionnaireMeta.analysisFramework.title
            : '-';

        return (
            <>
                <Page
                    className={_cs(styles.projectQuestionnaires, className)}
                    mainContentClassName={styles.main}
                    headerAboveSidebar
                    headerClassName={styles.header}
                    header={(
                        <>
                            <BackLink
                                className={styles.backLink}
                                defaultLink={reverseRoute(pathNames.projects, { projectId })}
                            />
                            <h2 className={styles.heading}>
                                {_ts('project.questionnaire', 'questionnairesHeaderTitle')}
                            </h2>
                        </>
                    )}
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <div className={styles.projectDetails}>
                                <h4 className={styles.heading}>
                                    {_ts('project.questionnaire', 'projectLabel')}
                                </h4>
                                <div className={styles.value}>
                                    { projectDetail.title || '-'}
                                </div>
                                <h4 className={styles.heading}>
                                    {_ts('project.questionnaire', 'frameworkLabel')}
                                </h4>
                                <div className={styles.value}>
                                    { frameworkName || '-'}
                                </div>
                            </div>
                            <div className={styles.questionnaires}>
                                <header className={styles.header}>
                                    <h4 className={styles.heading}>
                                        {_ts('project.questionnaire', 'questionnaireStatus')}
                                    </h4>
                                </header>
                                <VerticalTabs
                                    tabs={tabs}
                                    useHash
                                    replaceHistory
                                    modifier={this.tabsModifier}
                                />
                            </div>
                        </>
                    )}
                    mainContent={(
                        <MultiViewContainer
                            views={this.views}
                            useHash
                        />
                    )}
                />
            </>
        );
    }
}

export default connect(mapStateToProps)(
    RequestCoordinator(
        RequestClient(requestOptions)(
            Questionnaires,
        ),
    ),
);
