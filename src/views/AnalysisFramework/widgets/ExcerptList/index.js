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
export default class ExcerptTextList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const contentText = _ts('framework.excerptWidget', 'textOrImageExcerptWidgetLabel');

        return (
            <div className={styles.list}>
                {contentText}
            </div>
        );
    }
}
