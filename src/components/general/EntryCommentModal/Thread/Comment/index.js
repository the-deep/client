import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import { RequestClient } from '#request';
import _ts from '#ts';

import UserDetailActionBar from '../UserDetailActionBar';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    userDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    text: '',
    userDetails: {},
};

const requests = {
};

@RequestClient(requests)
export default class Comment extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            isParent,
            text,
            textHistory,
            userDetails,
            assigneeDetail: {
                name: assigneeName,
            } = {},
        } = this.props;

        return (
            <div className={_cs(className, styles.comment)}>
                <UserDetailActionBar
                    userDetails={userDetails}
                    isParent
                    textHistory={textHistory}
                />
                <div className={styles.commentText}>
                    {text}
                </div>
                {assigneeName && (
                    <div className={styles.assignee}>
                        {_ts('entryComment', 'assignedTo', { name: assigneeName })}
                    </div>
                )}
            </div>
        );
    }
}
