import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import deepLogo from '#resources/img/deep-logo-new.svg';
import Svg from '#components/Svg';
import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';

import styles from './styles.css';

const aryEndpoint = process.env.REACT_APP_ASSESSMENT_REGISTRY_END;

interface Props {
    className?: string;
}

function EditAssessment(props: Props) {
    const { className } = props;

    const { leadId } = useParams<{ leadId: string }>();
    const { project } = useContext(ProjectContext);

    const projectId = project?.id;

    const src = aryEndpoint && projectId && leadId
        ? `${aryEndpoint}/projects/${projectId}/leads/${leadId}/ary/edit/`
        : undefined;

    return (
        <div className={_cs(className, styles.editAssessment)}>
            <SubNavbar
                className={styles.header}
                heading="Assessment"
                defaultIcons={(
                    <div className={styles.appBrand}>
                        <Svg
                            src={deepLogo}
                            className={styles.logo}
                        />
                    </div>
                )}
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
