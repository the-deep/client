import React from 'react';

import BoundError from '#rs/components/General/BoundError';

import WidgetError from '#components/WidgetError';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

@BoundError(WidgetError)
export default class Matrix1dList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const contentText = _ts('framework.matrix1dWidget', 'matrix1DWidgetLabel');

        return (
            <div className={styles.list}>
                { contentText }
            </div>
        );
    }
}
