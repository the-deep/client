import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '#rsu/common';

import { pathNames } from '#constants';
import _ts from '#ts';

import Notification from '../Notification';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,
};

const defaultProps = {
    notification: {},
};

export default class ProjectJoinRequestAbortItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            notification: {
                data: {
                    requestedBy: {
                        displayName: requestorName,
                        id: requestorId,
                    },
                    project: {
                        id: projectId,
                        title: projectTitle,
                    },
                },
                timestamp,
            },
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.projectJoinRequestAbortNotification}
        `;

        const requestorProfileLink = reverseRoute(
            pathNames.userProfile,
            { userId: requestorId },
        );

        const projectLink = reverseRoute(
            pathNames.projects,
            { projectId },
        );

        return (
            <Notification
                className={className}
                message={
                    <div className={styles.message}>
                        {_ts('notifications', 'projectJoinRequestAbortText', {
                            requestorName: (
                                <a
                                    className={styles.requestorName}
                                    href={requestorProfileLink}
                                >
                                    {requestorName}
                                </a>
                            ),
                            projectTitle: (
                                <a
                                    className={styles.projectTitle}
                                    href={projectLink}
                                >
                                    {projectTitle}
                                </a>
                            ),
                        })}
                    </div>
                }
                timestamp={timestamp}
            />
        );
    }
}
