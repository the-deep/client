import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Badge from '#components/viewer/Badge';
import { pathNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const ProjectListItem = ({
    className,
    title,
    projectId,
    currentProjectId,
    isPrivate,
}) => (
    <div
        className={
            _cs(
                className,
                styles.listItem,
                'project-list-item',
                currentProjectId === projectId && styles.active,
            )
        }
    >
        <Link
            to={reverseRoute(pathNames.projects, { projectId })}
            className={styles.link}
        >
            {title}
            {isPrivate &&
                <Badge
                    className={styles.badge}
                    icon="locked"
                    title={_ts('project', 'privateProjectBadgeTitle')}
                    tooltip={_ts('project', 'privateProjectBadgeTooltip')}
                />
            }
        </Link>
    </div>
);

ProjectListItem.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    projectId: PropTypes.number,
    currentProjectId: PropTypes.number,
    isPrivate: PropTypes.bool,
};

ProjectListItem.defaultProps = {
    className: '',
    title: '',
    projectId: undefined,
    currentProjectId: undefined,
    isPrivate: false,
};

export default ProjectListItem;
