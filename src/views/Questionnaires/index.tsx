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

    AddRequestProps,
    AppState,
    Requests,
} from '#typings';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import QuestionnaireList from './QuestionnaireList';


import styles from './styles.scss';


interface ComponentProps {
    className?: string;
    projectId: number;
    projectDetail: ProjectElement;
}

interface State {
    currentPageForActiveTab: number;
    currentPageForArchivedTab: number;
}

type TabElement = 'active' | 'archived';

interface Params {
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireMetaRequest: {
        url: ({ props }) => `/projects/${props.projectId}/questionnaire-meta`,
        onPropsChanged: ['projectId'],
        method: methods.GET,
        onMount: true,
        // FIXME: write onFailure, onFatal
    },
};

const mapStateToProps = (state: AppState) => ({
    projectDetail: projectDetailsSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

const tabs: {[key in TabElement]: string} = {
    // FIXME: use strings
    active: 'Active',
    // FIXME: use strings
    archived: 'Archived',
};

class Questionnaires extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        // NOTE: may need to save this in redux
        this.state = {
            currentPageForActiveTab: 1,
            currentPageForArchivedTab: 1,
        };
    }

    private views = {
        active: {
            component: QuestionnaireList,
            rendererParams: () => ({
                // FIXME: use strings
                title: 'Active questionnaires',
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
                // FIXME: use strings
                title: 'Archived questionnaires',
                className: styles.content,
                projectId: this.props.projectId,
                archived: true,
                onQuestionnaireMetaReload: this.props.requests.questionnaireMetaRequest.do,
                activePage: this.state.currentPageForArchivedTab,
                onActivePageChange: this.handleCurrentPageChangeForArchivedTab,
            }),
        },
    }

    private handleCurrentPageChangeForActiveTab = (page: number) => {
        this.setState({ currentPageForActiveTab: page });
    }

    private handleCurrentPageChangeForArchivedTab = (page: number) => {
        this.setState({ currentPageForArchivedTab: page });
    }

    public render() {
        const {
            className,
            projectId,
            projectDetail,
            requests: {
                questionnaireMetaRequest: {
                    response,
                },
            },
        } = this.props;

        let frameworkName = '-';
        let counts: {[key in TabElement]: number} | undefined;

        if (response) {
            const {
                archivedCount,
                activeCount,
                analysisFramework,
            } = response as {
                archivedCount: number;
                activeCount: number;
                analysisFramework?: {
                    id: number;
                    title: string;
                };
            };

            if (analysisFramework) {
                frameworkName = analysisFramework.title;
            }

            counts = {
                active: activeCount,
                archived: archivedCount,
            };
        }

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
                                {/* FIXME: use strings */}
                                Questionnaires
                            </h2>
                        </>
                    )}
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <div className={styles.projectDetails}>
                                <h3 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Project
                                </h3>
                                <div className={styles.value}>
                                    { projectDetail.title || '-'}
                                </div>
                                <h3 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Analysis Framework
                                </h3>
                                <div className={styles.value}>
                                    { frameworkName || '-'}
                                </div>
                            </div>
                            <div className={styles.questionnaires}>
                                <h3 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Questionnaires
                                </h3>
                                <div className={styles.content}>
                                    <VerticalTabs
                                        tabs={tabs}
                                        useHash
                                        replaceHistory
                                        modifier={(itemKey: TabElement) => (
                                            <div className={styles.tab}>
                                                <div className={styles.label}>
                                                    { tabs[itemKey] }
                                                </div>
                                                <div className={styles.count}>
                                                    { counts ? counts[itemKey] : '-' }
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
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
