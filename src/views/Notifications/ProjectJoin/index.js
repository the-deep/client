import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import FormattedDate from '#rs/components/View/FormattedDate';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import { reverseRoute } from '#rs/utils/common';

import DisplayPicture from '#components/DisplayPicture';

import {
    pathNames,
    iconNames,
} from '#constants';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object.isRequired,
};

const defaultProps = {
};

export default class ProjectJoinItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            data,
        } = this.props;

        const {
            id,
            project,
            requestedBy,
            status,
        } = data.details;

        return (
            <div className={styles.projectJoinItem} >
                <DisplayPicture
                    className={styles.displayPicture}
                    galleryId={requestedBy.displayPicture}
                />
                <div className={styles.details}>
                    <div className={styles.description} >
                        <Link
                            className={styles.displayName}
                            target="_blank"
                            to={reverseRoute(pathNames.userProfile, { userId: requestedBy.id })}
                        >
                            {requestedBy.displayName}
                        </Link>
                        {_ts('notifications.projectJoin', 'requestedToJoin')}
                        <Link
                            className={styles.projectTitle}
                            target="_blank"
                            to={reverseRoute(pathNames.projects, { projectId: project.id })}
                        >
                            {project.title}
                        </Link>
                    </div>
                    <div className={styles.date} >
                        <span className={styles.label} >
                            {_ts('notifications.projectJoin', 'date')}
                        </span>
                        <FormattedDate
                            date={data.date}
                            mode="dd-MM-yyyy"
                        />
                    </div>
                    <div className={styles.actionButtons} >
                        <SuccessButton
                            className={styles.button}
                            iconName={iconNames.check}
                        >
                            Accept
                        </SuccessButton>
                        <DangerButton
                            className={styles.button}
                            iconName={iconNames.close}
                        >
                            Reject
                        </DangerButton>
                    </div>
                </div>
            </div>
        );
    }
}

