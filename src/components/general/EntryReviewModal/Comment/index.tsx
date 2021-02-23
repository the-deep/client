import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './styles.scss';

interface Props {
    text: string;
}
function Comment(props: Props) {
    const { text } = props;
    return (
        <div
            className={styles.comment}
        >
            <ReactMarkdown
                className={styles.commentText}
                source={text}
            />
        </div>
    );
}

export default Comment;
