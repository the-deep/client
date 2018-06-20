import PropTypes from 'prop-types';
import React from 'react';

import ResizableH from '#rscv/Resizable/ResizableH';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    dummy = () => {}

    render() {
        return (
            <ResizableH
                className={styles.overview}
                leftChild={<div>left</div>}
                rightChild={<div>right</div>}
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
