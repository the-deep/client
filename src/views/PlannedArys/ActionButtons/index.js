import PropTypes from 'prop-types';
import React from 'react';

import {
    RequestClient,
    methods,
} from '#request';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import LoadingAnimation from '#rscv/LoadingAnimation';

import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types, react/forbid-prop-types
    row: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onRemoveAry: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {};

const requestOptions = {
    plannedAryDeleteRequest: {
        url: ({ props: { row } }) => `/planned-assessments/${row.id}/`,
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

    handleAryRemoveClick = () => {
        const {
            requests: {
                plannedAryDeleteRequest,
            },
        } = this.props;
        plannedAryDeleteRequest.do();
    }

    render() {
        const {
            requests: {
                plannedAryDeleteRequest: {
                    pending,
                },
            },
        } = this.props;

        return (
            <div className={styles.actionButtons}>
                {pending && <LoadingAnimation />}
                <DangerConfirmButton
                    title={_ts('assessments.planned', 'removeAryButtonTitle')}
                    onClick={this.handleAryRemoveClick}
                    smallVerticalPadding
                    transparent
                    iconName="delete"
                    confirmationMessage={_ts('assessments.planned', 'plannedAryDeleteConfirmText')}
                />
            </div>
        );
    }
}
