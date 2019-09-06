import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '@togglecorp/fujs';

import { pathNames } from '#constants';
import _ts from '#ts';

import Notification from '../Notification';
import LinkItem from '../LinkItem';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    notification: {},
};

export default class ProjectJoinRequestAbortItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
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
            closeModal,
        } = this.props;

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
                    <div>
                        {_ts('notifications', 'projectJoinRequestAbortText', {
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
                        })}
                    </div>
                }
                timestamp={timestamp}
            />
        );
    }
}
