import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import {
    RequestClient,
    methods,
} from '#request';
import { reverseRoute } from '@togglecorp/fujs';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Icon from '#rscg/Icon';
import LoadingAnimation from '#rscv/LoadingAnimation';

import { pathNames } from '#constants/';
import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onRemoveAry: PropTypes.func.isRequired,
};

const defaultProps = {};

const requestOptions = {
    aryDeleteRequest: {
        url: ({ props: { row } }) => `/assessments/${row.id}/`,
        method: methods.DELETE,
        onMount: false,
        onSuccess: ({
            props: {
                onRemoveAry,
                row,
            },
        }) => {
            onRemoveAry(row.id);
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: 'Assessment Registry', // FIXME: strings
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
    },
};

@RequestClient(requestOptions)
export default class ActionButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getLinks = () => {
        const {
            activeProject,
            row,
        } = this.props;

        const editAry = {
            pathname: reverseRoute(
                pathNames.editAry,
                {
                    projectId: activeProject,
                    leadId: row.lead,
                },
            ),
        };

        return { editAry };
    }

    handleAryRemoveClick = () => {
        const {
            requests: {
                aryDeleteRequest,
            },
        } = this.props;
        aryDeleteRequest.do();
    }

    render() {
        const {
            requests: {
                aryDeleteRequest: {
                    pending,
                },
            },
        } = this.props;
        const links = this.getLinks();

        return (
            <div className={styles.actionButtons}>
                {pending && <LoadingAnimation />}
                <DangerConfirmButton
                    title={_ts('assessments', 'removeAryButtonTitle')}
                    onClick={this.handleAryRemoveClick}
                    smallVerticalPadding
                    transparent
                    iconName="delete"
                    confirmationMessage={_ts('assessments', 'aryDeleteConfirmText')}
                />
                <Link
                    className={styles.editLink}
                    title={_ts('assessments', 'editAryButtonTitle')}
                    to={links.editAry}
                >
                    <Icon name="edit" />
                </Link>
            </div>
        );
    }
}
