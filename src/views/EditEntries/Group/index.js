import PropTypes from 'prop-types';
import React from 'react';

import ResizableH from '#rscv/Resizable/ResizableH';

import LeftPanel from './LeftPane';

import styles from './styles.scss';

const propTypes = {
    bookId: PropTypes.number,
};

const defaultProps = {
    bookId: undefined,
};


export default class Group extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { bookId } = this.props;
        return (
            <ResizableH
                className={styles.group}
                leftChild={
                    <LeftPanel
                        className={styles.leftPanel}
                        bookId={bookId}
                    />
                }
                rightChild={
                    <React.Fragment>
                        <header className={styles.header}>
                            3 labels, 5 groups
                        </header>
                        <div className={styles.content}>
                            Nothing here
                        </div>
                    </React.Fragment>
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
