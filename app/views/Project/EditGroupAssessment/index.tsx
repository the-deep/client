import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';

import styles from './styles.css';

const aryEndpoint = process.env.REACT_APP_ASSESSMENT_REGISTRY_END;

interface Props {
    className?: string;
}

function EditGroupAssessment(props: Props) {
    const { className } = props;

    const { leadGroupId } = useParams<{ leadGroupId: string }>();
    const { project } = useContext(ProjectContext);

    const projectId = project?.id;

    const src = aryEndpoint && projectId && leadGroupId
        ? `${aryEndpoint}/projects/${projectId}/lead-groups/${leadGroupId}/ary/edit/`
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

export default EditGroupAssessment;
