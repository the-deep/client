import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Page from '#rscv/Page';
import SelectInput from '#rsci/SelectInput';

import Badge from '#components/viewer/Badge';
import ButtonLikeLink from '#components/general/ButtonLikeLink';
import { pathNames } from '#constants';

import {
    AppState,
    ProjectElement,
} from '#typings';

import {
    currentUserProjectsSelector,
} from '#redux';

import _ts from '#ts';

import RecentProjects from './RecentProjects';
import styles from './styles.scss';

const projectKeySelector = (option: ProjectElement) => (option.id);
const projectLabelSelector = (option: ProjectElement) => (option.title);

const mapStateToProps = (state: AppState) => ({
    userProjects: currentUserProjectsSelector(state),
});

interface ViewProps {
    userProjects: ProjectElement[];
}

function Home(props: ViewProps) {
    const {
        userProjects,
    } = props;

    const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined);

    const optionLabelSelector = useCallback((option: ProjectElement) => (
        <div className={styles.selectOption}>
            {option.title}
            {option.isPrivate && (
                <Badge
                    icon="locked"
                    className={
                        _cs(
                            styles.badge,
                            selectedProject === option.id && styles.active,
                        )
                    }
                    noBorder
                    tooltip={_ts('home', 'priivateProjectBadgeTooltip')}
                />
            )}
        </div>
    ), [selectedProject]);

    return (
        <Page
            className={styles.home}
            mainContentClassName={styles.mainContent}
            mainContent={(
                <>
                    <div className={styles.leftContainer}>
                        <div className={styles.leftTopContainer}>
                            <div className={styles.summaryContainer}>
                                <header className={styles.header}>
                                    <h2 className={styles.heading}>
                                        {_ts('home', 'summaryOfMyProjectsHeading')}
                                    </h2>
                                </header>
                                <div className={styles.content} />
                            </div>
                            <div className={styles.projectTaggingActivity}>
                                <header className={styles.header}>
                                    <h2 className={styles.heading}>
                                        {_ts('home', 'projectTaggingActivityHeading')}
                                    </h2>
                                </header>
                                <div className={styles.content} />
                            </div>
                        </div>
                        <div className={styles.leftBottomContainer}>
                            <header className={styles.header}>
                                <h2 className={styles.heading}>
                                    {_ts('home', 'recentProjectsHeading')}
                                </h2>
                                <SelectInput
                                    hideClearButton
                                    keySelector={projectKeySelector}
                                    labelSelector={projectLabelSelector}
                                    optionLabelSelector={optionLabelSelector}
                                    options={userProjects}
                                    placeholder={_ts('components.navbar', 'selectEventPlaceholder')}
                                    showHintAndError={false}
                                    showLabel={false}
                                    className={styles.projectSelectInput}
                                    value={selectedProject}
                                    onChange={setSelectedProject}
                                />
                                <ButtonLikeLink
                                    type="primary"
                                    to={reverseRoute(pathNames.projects, {})}
                                >
                                    {_ts('home', 'setupNewProjectButtonLabel')}
                                </ButtonLikeLink>
                            </header>
                            <RecentProjects
                                className={styles.recentProjects}
                                selectedProject={selectedProject}
                            />
                        </div>
                    </div>
                    <div className={styles.rightContainer} />
                </>
            )}
        />
    );
}

export default connect(mapStateToProps)(Home);
