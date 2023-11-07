import React, { useContext, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import {
    Header,
    QuickActionLink,
    TextOutput,
} from '@the-deep/deep-ui';
import {
    IoCalendarNumberOutline,
    IoPersonOutline,
    IoPencil,
    IoShareSocialOutline,
} from 'react-icons/io5';

import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    title: string;
    reportId: string;
    slug: string;
    projectId: string;
    latestPublishedBy: string | null | undefined;
    latestPublishedOn: string | null | undefined;
}

function ReportItem(props: Props) {
    const {
        title,
        slug,
        reportId,
        projectId,
        latestPublishedBy,
        latestPublishedOn,
    } = props;

    const {
        project,
    } = useContext(ProjectContext);

    const viewReportLink = useMemo(() => ({
        pathname: generatePath(routes.publicReportView.path, {
            reportSlug: slug,
        }),
    }), [
        slug,
    ]);

    const editReportLink = useMemo(() => ({
        pathname: generatePath(routes.reportEdit.path, {
            projectId,
            reportId,
        }),
    }), [
        projectId,
        reportId,
    ]);

    return (
        <Header
            heading={title}
            headingSize="small"
            className={styles.reportItem}
            descriptionClassName={styles.headerDescription}
            description={(
                <>
                    {latestPublishedBy && (
                        <TextOutput
                            valueContainerClassName={styles.label}
                            label={(
                                <IoPersonOutline
                                    title="Published By"
                                />
                            )}
                            value={latestPublishedBy}
                            hideLabelColon
                        />
                    )}
                    {latestPublishedOn && (
                        <TextOutput
                            valueContainerClassName={styles.label}
                            label={(
                                <IoCalendarNumberOutline
                                    title="Published Date"
                                />
                            )}
                            valueType="date"
                            value={latestPublishedOn}
                            hideLabelColon
                        />
                    )}
                </>
            )}
            actions={(
                <>
                    {project?.enablePubliclyViewableAnalysisReportSnapshot && (
                        <QuickActionLink
                            to={viewReportLink}
                            disabled={(
                                !viewReportLink
                                || !project?.enablePubliclyViewableAnalysisReportSnapshot
                            )}
                            title="Share Latest Report"
                            target="_blank"
                        >
                            <IoShareSocialOutline />
                        </QuickActionLink>
                    )}
                    <QuickActionLink
                        title="Edit Report"
                        to={editReportLink}
                    >
                        <IoPencil />
                    </QuickActionLink>
                </>
            )}
        />
    );
}

export default ReportItem;
