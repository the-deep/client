import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import {
    aryTemplateQuestionnaireListSelector,
} from '#redux';

import ListView from '#rscv/List/ListView';
import Method from './Method';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {

};

const mapStateToProps = state => ({
    questionnaireList: aryTemplateQuestionnaireListSelector(state),
});

const getMethodRendererParams = (_, d) => ({ data: d });
const methodKeySelector = d => d.id;

@connect(mapStateToProps)
export default class HNO extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getHNOQuestionnaireList = memoize(questionnaireList => (
        questionnaireList.filter(d => d.method === 'hno')
    ))

    render() {
        const {
            pending,
            className,
            data,
        } = this.props;

        return (
            <ListView
                className={className}
                data={data}
                renderer={Method}
                rendererParams={getMethodRendererParams}
                keySelector={methodKeySelector}
            />
        );
    }
}
