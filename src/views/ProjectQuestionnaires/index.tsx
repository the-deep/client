import React from 'react';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Page from '#rscv/Page';
import VerticalTabs from '#rscv/VerticalTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import AddQuestionnaireButton from './AddQuestionnaireButton';
import QuestionnaireList from './QuestionnaireList';
import styles from './styles.scss';

interface Props {
    className?: string;
    projectId: number;
    projectName: string;
    frameworkName: string;
}

type TabElement = 'active' | 'archived';

class ProjectQuestionnares extends React.PureComponent<Props> {
    private tabs: {[key in TabElement]: string} = {
        active: 'Active',
        archived: 'Archived',
    };

    private views = {
        active: {
            component: QuestionnaireList,
            rendererParams: () => ({
                title: 'Active questionnaires',
            }),
        },
        archived: {
            component: QuestionnaireList,
            rendererParams: () => ({
                title: 'Archived questionnaires',
            }),
        },
    }

    public render() {
        const {
            className,
            projectId,
            projectName = 'Venezuela',
            frameworkName = 'Okular analysis generic',
        } = this.props;

        return (
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
                                                2
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <AddQuestionnaireButton />
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
        );
    }
}

export default ProjectQuestionnares;
