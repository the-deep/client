import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';

import { oldAryEndpoint } from '#base/configs/env';

import styles from './styles.css';

interface Props {
    className?: string;
}

function EditAssessment(props: Props) {
    const { className } = props;

    const { leadId } = useParams<{ leadId: string }>();
    const { project } = useContext(ProjectContext);

    const projectId = project?.id;

    const src = oldAryEndpoint && projectId && leadId
        ? `${oldAryEndpoint}/projects/${projectId}/leads/${leadId}/ary/edit/`
        : undefined;

    return (
        <div className={_cs(className, styles.editAssessment)}>
            <SubNavbar
                className={styles.header}
                heading="Assessment"
                homeLinkShown
                defaultActions={(
                    <BackLink defaultLink="/">
                        Close
                    </BackLink>
                )}
            />
            <div className={styles.container}>
                {src && (
                    <iframe
                        className={styles.iframe}
                        src={src}
                        title="editAry"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
                    />
                )}
            </div>
        </div>
    );
}

export default EditAssessment;
