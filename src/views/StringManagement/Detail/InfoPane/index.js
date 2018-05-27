import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import WarningButton from '#rs/components/Action/Button/WarningButton';
import ListView from '#rs/components/View/List/ListView';
import Message from '#rs/components/View/Message';
import Confirm from '#rs/components/View/Modal/Confirm';

import {
    problemCollectionSelector,
    problemCollectionStatsSelector,
    selectedLinkCollectionNameSelector,
    selectedLanguageNameSelector,

    stringMgmtRemoveStringChangeAction,
    stringMgmtRemoveLinkChangeAction,
} from '#redux';
import { iconNames } from '#constants';

/*
eslint css-modules/no-unused-class: [
    1,
    {
        markAsUsed: [
            'error', 'warning', 'info',
        ],
        camelCase: true
    }
]
*/
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    problemCollection: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    problemCollectionStats: PropTypes.object.isRequired,

    selectedLinkCollectionName: PropTypes.string.isRequired,
    selectedLanguageName: PropTypes.string.isRequired,
    removeStringChange: PropTypes.func.isRequired,
    removeLinkChange: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    problemCollection: problemCollectionSelector(state, props),
    problemCollectionStats: problemCollectionStatsSelector(state, props),

    selectedLinkCollectionName: selectedLinkCollectionNameSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    removeStringChange: params => dispatch(stringMgmtRemoveStringChangeAction(params)),
    removeLinkChange: params => dispatch(stringMgmtRemoveLinkChangeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class InfoPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showConfirm: false,
            confirmData: {},
        };
    }

    handleStringChangeDeleteButtonClick = (id) => {
        this.setState({
            showConfirm: true,
            confirmData: {
                type: 'string',
                action: 'delete',
                identifier: id,
            },
        });
    }

    handleLinkChangeDeleteButtonClick = (key) => {
        this.setState({
            showConfirm: true,
            confirmData: {
                type: 'link',
                action: 'delete',
                identifier: key,
            },
        });
    }

    handleConfirmClose = (confirm) => {
        const { confirmData } = this.state;

        if (confirm && confirmData.action === 'delete' && confirmData.type === 'string') {
            this.props.removeStringChange({
                id: confirmData.identifier,
                languageName: this.props.selectedLanguageName,
            });
        } else if (confirm && confirmData.action === 'delete' && confirmData.type === 'link') {
            this.props.removeLinkChange({
                key: confirmData.identifier,
                languageName: this.props.selectedLanguageName,
                linkCollectionName: this.props.selectedLinkCollectionName,
            });
        }

        this.setState({
            showConfirm: false,
            confirmData: {},
        });
    }

    renderProblem = currentProblem => (key, d, i) => {
        let child = null;
        switch (currentProblem.title) {
            case 'Unused string':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.value}</span>
                        {/* TODO: remove string
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        */}
                    </Fragment>
                );
                break;

            case 'Unused link':
                child = (
                    <Fragment>
                        <span>{d}</span>
                        {/* TODO: remove link
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        */}
                    </Fragment>
                );
                break;
            case 'Undefined link':
                child = (
                    <Fragment>
                        <span>{d}</span>
                        {/* TODO: add link
                        <SuccessButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.add}
                            disabled
                        />
                        */}
                    </Fragment>
                );
                break;
            case 'Bad link':
                child = (
                    <Fragment>
                        <span>{d}</span>
                        {/* TODO: edit link
                        <WarningButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.edit}
                            disabled
                        />
                        */}
                    </Fragment>
                );
                break;

            case 'Added link':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.string}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleLinkChangeDeleteButtonClick(d.key)}
                        />
                        { d.message !== undefined &&
                            <div className={styles.message}>
                                {d.message}
                            </div>
                        }
                    </Fragment>
                );
                break;
            case 'Deleted link':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.oldString}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleLinkChangeDeleteButtonClick(d.key)}
                        />
                        { d.message !== undefined &&
                            <div className={styles.message}>
                                {d.message}
                            </div>
                        }
                    </Fragment>
                );
                break;
            case 'Edited link':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.oldString} → {d.string}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleLinkChangeDeleteButtonClick(d.key)}
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            case 'Added string':
                child = (
                    <Fragment>
                        <span>{d.id}: {d.value}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleStringChangeDeleteButtonClick(d.id)}
                        />
                        { d.message !== undefined &&
                            <div className={styles.message}>
                                {d.message}
                            </div>
                        }
                    </Fragment>
                );
                break;
            case 'Deleted string':
                child = (
                    <Fragment>
                        <span>{d.id}: {d.oldValue}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleStringChangeDeleteButtonClick(d.id)}
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            case 'Edited string':
                child = (
                    <Fragment>
                        <span>{d.id}: {d.oldValue} → {d.value}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleStringChangeDeleteButtonClick(d.id)}
                        />
                        { d.message !== undefined &&
                            <div className={styles.message}>
                                {d.message}
                            </div>
                        }
                    </Fragment>
                );
                break;
            default:
                break;
        }

        return (
            <div
                key={i}
                className={styles.item}
            >
                {child}
            </div>
        );
    }

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
                    modifier={this.renderProblem(currentProblem)}
                />
            </div>
        );
    }

    render() {
        const { problemCollectionStats } = this.props;
        const { showConfirm } = this.state;

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
            <Fragment>
                <ListView
                    className={styles.problems}
                    data={problemKeys}
                    modifier={this.renderProblemGroup}
                />
                <Confirm
                    show={showConfirm}
                    closeOnEscape
                    onClose={this.handleConfirmClose}
                >
                    <p>
                        Do you want to discard this change?
                    </p>
                </Confirm>
            </Fragment>
        );
    }
}
