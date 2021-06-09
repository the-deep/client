import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import Question from '../Question';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object.isRequired,
};

const defaultProps = {
    className: undefined,
};

const getQuestionRendererParams = (_, d) => ({ data: d });
const questionKeySelector = d => d.id;

export default class Method extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            data,
        } = this.props;

        return (
            <div className={_cs(className, styles.subMethod)}>
                <div className={styles.title}>
                    { data.title }
                </div>
                <ListView
                    className={styles.questionList}
                    data={data.questions}
                    renderer={Question}
                    rendererParams={getQuestionRendererParams}
                    keySelector={questionKeySelector}
                />
            </div>
        );
    }
}
