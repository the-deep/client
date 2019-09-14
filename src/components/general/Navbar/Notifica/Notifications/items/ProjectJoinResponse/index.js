import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '@togglecorp/fujs';

import DisplayPicture from '#components/viewer/DisplayPicture';
import { pathNames } from '#constants';
import _ts from '#ts';

import Notification from '../Notification';
import LinkItem from '../LinkItem';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,
    className: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
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
            closeModal,
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

        const stringParams = {
            responderName: (
                <LinkItem
                    link={responderProfileLink}
                    title={responderName}
                    closeModal={closeModal}
                />
            ),
            requestorName: (
                <LinkItem
                    link={requestorProfileLink}
                    title={requestorName}
                    closeModal={closeModal}
                />
            ),
            projectTitle: (
                <LinkItem
                    link={projectLink}
                    title={projectTitle}
                    closeModal={closeModal}
                />
            ),
        };

        let messageText = '';
        if (status === PROJECT_JOIN_ACCEPTED) {
            messageText = _ts('notifications.projectJoinResponse', 'acceptText', stringParams);
        } else if (status === PROJECT_JOIN_REJECTED) {
            messageText = _ts('notifications.projectJoinResponse', 'rejectText', stringParams);
        }

        if (status === PROJECT_JOIN_REJECTED || status === PROJECT_JOIN_ACCEPTED) {
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
                        <div>
                            {messageText}
                        </div>
                    }
                    timestamp={timestamp}
                />
            );
        }

        return null;
    }
}
