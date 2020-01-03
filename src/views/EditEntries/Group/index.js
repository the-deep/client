// import PropTypes from 'prop-types';
import React from 'react';

import modalize from '#rscg/Modalize';
import ResizableH from '#rscv/Resizable/ResizableH';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};


export default class Group extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <ResizableH
                className={styles.group}
                leftChild={
                    <div className={styles.leftPanel} />
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
