import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import {
    aryTemplateQuestionnaireListSelector,
} from '#redux';

import Questionnaire from '../Questionnaire';
import styles from './styles.scss';

const propTypes = {
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    questionnaireList: aryTemplateQuestionnaireListSelector(state),
});

@connect(mapStateToProps)
export default class CNA extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getCNAQuestionnaireList = memoize(questionnaireList => (
        questionnaireList.filter(d => d.method === 'cna')
    ))

    render() {
        const {
            pending,
            className,
            questionnaireList,
        } = this.props;

        const cnaQuestionnaireList = this.getCNAQuestionnaireList(questionnaireList);

        return (
            <div className={className}>
                <Questionnaire
                    data={cnaQuestionnaireList}
                />
            </div>
        );
    }
}
