import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';
import { FaramGroup } from '@togglecorp/faram';

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
            questionnaireList,
        } = this.props;

        const hnoQuestionnaireList = this.getHNOQuestionnaireList(questionnaireList);

        return (
            <div className={_cs(className, styles.hno)}>
                <FaramGroup faramElementName="hno">
                    <Questionnaire
                        data={hnoQuestionnaireList}
                    />
                </FaramGroup>
            </div>
        );
    }
}
