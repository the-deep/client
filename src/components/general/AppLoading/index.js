import React from 'react';

import Message from '#rscv/Message';
import { getRandomFromList } from '@togglecorp/fujs';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
};

export default class AppLoading extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const loadingMessages = [
            _ts('components.appLoading', 'loadingMessages1'),
            _ts('components.appLoading', 'loadingMessages2'),
            _ts('components.appLoading', 'loadingMessages3'),
            _ts('components.appLoading', 'loadingMessages4'),
            _ts('components.appLoading', 'loadingMessages5'),
            _ts('components.appLoading', 'loadingMessages6'),
            _ts('components.appLoading', 'loadingMessages7'),
            _ts('components.appLoading', 'loadingMessages8'),
            _ts('components.appLoading', 'loadingMessages9'),
            _ts('components.appLoading', 'loadingMessages10'),
            _ts('components.appLoading', 'loadingMessages11'),
            _ts('components.appLoading', 'loadingMessages12'),
            _ts('components.appLoading', 'loadingMessages13'),
            _ts('components.appLoading', 'loadingMessages14'),
            _ts('components.appLoading', 'loadingMessages15'),
        ];

        // Get a random message from the loading message list
        this.randomMessage = getRandomFromList(loadingMessages);
    }

    render() {
        return (
            <Message className={styles.messageContainer}>
                { this.randomMessage }
            </Message>
        );
    }
}
