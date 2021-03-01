import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    _cs,
} from '@togglecorp/fujs';

import FormattedDate from '#rscv/FormattedDate';
import DisplayPicture from '#components/viewer/DisplayPicture';

import { EntryComment } from '#typings';

import styles from './styles.scss';

interface Props {
    comment: EntryComment;
}

const commentTypeToTextMap: {[id: number]: string} = {
    0: 'commented',
    1: 'approved',
    2: 'unapproved',
    3: 'controlled',
    4: 'uncontrolled',
};

interface User {
    id: number;
    name: string;
}

interface SeparateNamesProps {
    users: User[];
}

function SeparateNames(props: SeparateNamesProps) {
    const { users } = props;
    if (users.length < 1) {
        return null;
    }

    const list = users.map((user: User) => (
        <span key={user.id} className={styles.name}>{user.name}</span>
    ));

    const out: ReactNode[] = [];
    list.forEach((user, i) => {
        if (list.length > 1 && i === list.length - 1) {
            out.push(' and ');
        }
        out.push(user);
        if (list.length > 2 && i < list.length - 2) out.push(', ');
    });
    return <span>{out}</span>;
}

function Comment(props: Props) {
    const {
        comment: {
            textHistory,
            createdByDetail,
            commentType,
            mentionedUsersDetail,
        },
    } = props;

    const [latest] = textHistory;

    return (
        <div
            className={styles.comment}
        >
            <DisplayPicture
                className={styles.displayPicture}
                url={createdByDetail.displayPicture}
            />
            <div
                className={styles.content}
            >
                <div className={styles.detail}>
                    <span className={styles.name}>{createdByDetail.name}</span>
                    <span>
                        &nbsp; {commentTypeToTextMap[commentType]} on &nbsp;
                        <FormattedDate
                            value={latest.createdAt}
                            mode="dd-MMM-yyyy"
                        />
                         &nbsp; and assigned it to &nbsp;
                    </span>
                    <span>
                        <SeparateNames
                            users={mentionedUsersDetail}
                        />
                    </span>
                </div>
                <ReactMarkdown
                    className={styles.commentText}
                    source={latest.text}
                />
            </div>
        </div>
    );
}

export default Comment;
