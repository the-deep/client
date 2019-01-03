import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '#rsu/common';

import DisplayPicture from '#components/viewer/DisplayPicture';
import { pathNames } from '#constants';
import _ts from '#ts';

import Notification from '../Notification';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    notification: {},
    className: '',
};

const emptyObject = {};

const PROJECT_JOIN_ACCEPTED = 'accepted';
const PROJECT_JOIN_REJECTED = 'rejected';

export default class ProjectJoinResponseItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            notification: {
                data: {
                    respondedBy: {
                        displayPicture: responderDisplayPictureId,
                        displayName: responderName,
                        id: responderId,
                    } = emptyObject,
                    requestedBy: {
                        displayName: requestorName,
                        id: requestorId,
                    } = emptyObject,
                    project: {
                        id: projectId,
                        title: projectTitle,
                    } = emptyObject,
                    status,
                },
                timestamp,
            },
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.projectJoinResponseNotification}
        `;

        const responderProfileLink = reverseRoute(
            pathNames.userProfile,
            { userId: responderId },
        );

        const requestorProfileLink = reverseRoute(
            pathNames.userProfile,
            { userId: requestorId },
        );

        const projectLink = reverseRoute(
            pathNames.projects,
            { projectId },
        );

        if (status === PROJECT_JOIN_ACCEPTED) {
            return (
                <Notification
                    className={className}
                    icon={
                        <DisplayPicture
                            className={styles.displayPicture}
                            galleryId={responderDisplayPictureId}
                        />
                    }
                    message={
                        <div className={styles.message}>
                            {_ts('notifications.projectJoinResponse', 'acceptText', {
                                responderName: (
                                    <a
                                        className={styles.responderName}
                                        href={responderProfileLink}
                                    >
                                        {responderName}
                                    </a>
                                ),
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
        } else if (status === PROJECT_JOIN_REJECTED) {
            return (
                <Notification
                    className={className}
                    icon={
                        <DisplayPicture
                            className={styles.displayPicture}
                            galleryId={responderDisplayPictureId}
                        />
                    }
                    message={
                        <div className={styles.message}>
                            {_ts('notifications.projectJoinResponse', 'rejectText', {
                                responderName: (
                                    <a
                                        className={styles.responderName}
                                        href={responderProfileLink}
                                    >
                                        {responderName}
                                    </a>
                                ),
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

        return null;
    }
}
