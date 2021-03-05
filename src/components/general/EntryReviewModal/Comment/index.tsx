import React from 'react';
import { _cs } from '@togglecorp/fujs';
import ReactMarkdown from 'react-markdown';

import FormattedDate from '#rscv/FormattedDate';
import DisplayPicture from '#components/viewer/DisplayPicture';
import CommaSeparateItems from '#components/viewer/CommaSeparateItems';

import { EntryComment } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

interface Props {
    className?: string;
    comment: EntryComment;
}

const commentTypeToTextMap: {[id: number]: string} = {
    0: _ts('entryReview', 'commented'),
    1: _ts('entryReview', 'approved'),
    2: _ts('entryReview', 'unapproved'),
    3: _ts('entryReview', 'controlled'),
    4: _ts('entryReview', 'uncontrolled'),
};

function Comment(props: Props) {
    const {
        className,
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
            className={_cs(styles.comment, className)}
        >
            <DisplayPicture
                className={styles.displayPicture}
                url={createdByDetail.displayPicture}
            />
            <div
                className={styles.content}
            >
                <span className={styles.detail}>
                    <span className={styles.name}>{createdByDetail.name}</span>
                    <span>
                        &nbsp;
                        {_ts('entryReview', 'commentType', { commentType: commentTypeToTextMap[commentType] })}
                        &nbsp;
                        <FormattedDate
                            value={latest.createdAt}
                            mode="dd-MMM-yyyy"
                        />
                        &nbsp;
                        {_ts('entryReview', 'assignedItTo')}
                        &nbsp;
                    </span>
                    <span>
                        <CommaSeparateItems
                            items={mentionedUsersDetail}
                        />
                    </span>
                </span>
                <ReactMarkdown
                    source={latest.text}
                />
            </div>
        </div>
    );
}

export default Comment;
