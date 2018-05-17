import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import WarningButton from '../../../../vendor/react-store/components/Action/Button/WarningButton';
import Message from '../../../../vendor/react-store/components/View/Message';

import {
    problemCollectionSelector,
    problemCollectionStatsSelector,
} from '../../../../redux';
import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    problemCollection: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    problemCollectionStats: PropTypes.object.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    problemCollection: problemCollectionSelector(state, props),
    problemCollectionStats: problemCollectionStatsSelector(state, props),
});

@connect(mapStateToProps)
export default class InfoPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = d => d;

    renderActions = (type) => {
        switch (type) {
            case 'Unused string':
            case 'Unused link':
                return (
                    <DangerButton
                        transparent
                        smallVerticalPadding
                        iconName={iconNames.delete}
                        disabled
                    />
                );
            case 'Undefined link':
                return (
                    <SuccessButton
                        transparent
                        smallVerticalPadding
                        iconName={iconNames.add}
                        disabled
                    />
                );
            case 'Bad link':
                return (
                    <WarningButton
                        transparent
                        smallVerticalPadding
                        iconName={iconNames.edit}
                        disabled
                    />
                );
            case 'Added link':
            case 'Deleted link':
            case 'Edited link':
            case 'Added string':
            case 'Deleted string':
            case 'Edited string':
                return (
                    <DangerButton
                        transparent
                        smallVerticalPadding
                        iconName={iconNames.delete}
                        disabled
                    />
                );
            default:
                return null;
        }
    }

    // FIXME: separate component
    renderProblem = currentProblem => (key, d) => (
        <div key={key} className={styles.item}>
            <span>
                {d}
            </span>
            { this.renderActions(currentProblem.title) }
        </div>
    )

    renderProblemGroup = (k, data) => {
        const { problemCollection } = this.props;
        const currentProblem = problemCollection[data];

        if (!currentProblem || currentProblem.instances.length === 0) {
            return null;
        }

        return (
            <div
                className={`${styles.problem} ${styles[currentProblem.type]}`}
                key={data}
            >
                <h4 className={styles.title}>
                    {currentProblem.title}
                </h4>
                <ListView
                    className={styles.instances}
                    data={currentProblem.instances}
                    keyExtractor={InfoPane.keyExtractor}
                    modifier={this.renderProblem(currentProblem)}
                />
            </div>
        );
    }

    render() {
        const { problemCollectionStats } = this.props;

        const {
            errorCount = 0,
            warningCount = 0,
            infoCount = 0,
        } = problemCollectionStats;

        if (errorCount + warningCount + infoCount <= 0) {
            return (
                <Message className={styles.noProblems}>
                    Everything looks good
                </Message>
            );
        }

        const problemKeys = Object.keys(this.props.problemCollection);
        return (
            <ListView
                className={styles.problems}
                data={problemKeys}
                modifier={this.renderProblemGroup}
            />
        );
    }
}
