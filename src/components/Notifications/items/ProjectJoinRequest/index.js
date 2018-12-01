import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '#rsu/common';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';

import DisplayPicture from '#components/DisplayPicture';
import {
    pathNames,
    iconNames,
} from '#constants';
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

const REQUEST_PENDING = 'pending';

export default class ProjectJoinRequestItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            notification: {
                data: {
                    status,
                    requestedBy: {
                        displayPicture: requestorDisplayPictureId,
                        displayName: requestorName,
                        id: requestorId,
                    } = {},
                    project: {
                        id: projectId,
                        title: projectTitle,
                    } = {},
                },
                timestamp,
            },
        } = this.props;

        if (!projectId) {
            return null;
        }

        const className = `
            ${classNameFromProps}
            ${styles.projectJoinRequestNotification}
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
                icon={
                    <DisplayPicture
                        className={styles.displayPicture}
                        galleryId={requestorDisplayPictureId}
                    />
                }
                message={
                    <div className={styles.message}>
                        {_ts('notifications.projectJoinRequest', 'message', {
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
                actions={
                    status === REQUEST_PENDING && (
                        <React.Fragment>
                            <SuccessButton
                                className={styles.button}
                                iconName={iconNames.check}
                                onClick={this.handleAddButtonClick}
                                transparent
                            >
                                {_ts('notifications.projectJoinRequest', 'addButtonTitle')}
                            </SuccessButton>
                            <WarningButton
                                className={styles.button}
                                iconName={iconNames.check}
                                onClick={this.handleAddAsAdminButtonClick}
                                transparent
                            >
                                {_ts('notifications.projectJoinRequest', 'addAsAdminButtonTitle')}
                            </WarningButton>
                            <DangerButton
                                className={styles.button}
                                iconName={iconNames.close}
                                onClick={this.handleRejectButtonClick}
                                transparent
                            >
                                {_ts('notifications.projectJoinRequest', 'rejectButtonTitle')}
                            </DangerButton>
                        </React.Fragment>
                    )
                }
            />
        );
    }
}
