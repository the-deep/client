import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    useParams,
} from 'react-router-dom';

import ProjectContext from '#base/context/ProjectContext';

import styles from './styles.css';

interface Props {
    className?: string;
}
function EditAssessment(props: Props) {
    const { project } = React.useContext(ProjectContext);
    const { leadId } = useParams<{ leadId: string }>();
    const projectId = project ? project.id : undefined;
    const { className } = props;
    const aryEndpoint = process.env.REACT_APP_ASSESSMENT_REGISTRY_END;
    const src = `${aryEndpoint}/projects/${projectId}/leads/${leadId}/ary/edit/`;

    return (
        <div className={_cs(className, styles.editAssessment)}>
            {aryEndpoint && (
                <iframe
                    key={leadId}
                    className={styles.iframe}
                    src={src}
                    title="editAry"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
                />
            )}
        </div>
    );
}

export default EditAssessment;
