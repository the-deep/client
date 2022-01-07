import React, { useCallback } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { _cs } from '@togglecorp/fujs';
import {
    // generatePath,
    // useMatch,
    useNavigate,
} from 'react-router-dom';

import ProjectSelectInput from '#components/selections/ProjectSelectInput';
import SmartQuickActionLink from '#base/components/SmartQuickActionLink';
import ProjectContext from '#base/context/ProjectContext';
import routes from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function ProjectSwitcher(props: Props) {
    const {
        className,
    } = props;

    const { project } = React.useContext(ProjectContext);

    // const { path, params } = useMatch();
    const navigate = useNavigate();

    const handleChange = useCallback(
        (value: string) => {
            // const newPath = generatePath(path, { ...params, projectId: value });
            // navigate(newPath);
            console.warn(value);
            navigate('/');
        },
        [navigate],
    );

    return (
        <div className={_cs(styles.projectSwitcher, className)}>
            <ProjectSelectInput
                name="project"
                value={project?.id}
                onChange={handleChange}
                options={project ? [project] : undefined}
                variant="general"
                nonClearable
            />
            <SmartQuickActionLink
                variant="secondary"
                route={routes.projectEdit}
                title="Edit Project"
            >
                <FiEdit2 />
            </SmartQuickActionLink>
        </div>
    );
}
export default ProjectSwitcher;
