import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';

import styles from './styles.css';

interface Props {
    className?: string;
}

function EditAry(props: Props) {
    const { className } = props;

    const { leadId } = useParams<{ leadId: string }>();
    const { project } = useContext(ProjectContext);

    const projectId = project?.id;

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
                New assessment registry
            </div>
        </div>
    );
}

export default EditAry;
