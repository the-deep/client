import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import ListView from '#rscv/List/ListView';
import Message from '#rscv/Message';

import {
    problemCollectionSelector,
    problemCollectionStatsSelector,
    selectedLinkCollectionNameSelector,
    selectedLanguageNameSelector,

    stringMgmtRemoveStringChangeAction,
    stringMgmtRemoveLinkChangeAction,
} from '#redux';
import { iconNames } from '#constants';

import EditLinkModal from '../EditLinkModal';
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

    disabled: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    problemCollection: problemCollectionSelector(state),
    problemCollectionStats: problemCollectionStatsSelector(state),

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
            showEditLinkModal: false,
            editLinkId: undefined,
        };
    }

    handleEditLinkButtonClick = (id) => {
        this.setState({
            editLinkId: id,
            showEditLinkModal: true,
        });
    }

    handleEditLinkModalClose = () => {
        this.setState({ showEditLinkModal: false });
    }

    handleStringChangeDeleteButtonClick = (id) => {
        this.props.removeStringChange({
            id,
            languageName: this.props.selectedLanguageName,
        });
    }

    handleLinkChangeDeleteButtonClick = (key) => {
        this.props.removeLinkChange({
            key,
            languageName: this.props.selectedLanguageName,
            linkCollectionName: this.props.selectedLinkCollectionName,
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
                        <SuccessButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.add}
                            onClick={() => this.handleEditLinkButtonClick(d)}
                            disabled={this.props.disabled}
                        />
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
                        <DangerConfirmButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleLinkChangeDeleteButtonClick(d.key)}
                            confirmationMessage="Do you want to discard this change"
                            disabled={this.props.disabled}
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
                        <DangerConfirmButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleLinkChangeDeleteButtonClick(d.key)}
                            confirmationMessage="Do you want to discard this change"
                            disabled={this.props.disabled}
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
                        <DangerConfirmButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleLinkChangeDeleteButtonClick(d.key)}
                            confirmationMessage="Do you want to discard this change"
                            disabled={this.props.disabled}
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
                        <DangerConfirmButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleStringChangeDeleteButtonClick(d.id)}
                            confirmationMessage="Do you want to discard this change"
                            disabled={this.props.disabled}
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
                        <DangerConfirmButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleStringChangeDeleteButtonClick(d.id)}
                            confirmationMessage="Do you want to discard this change"
                            disabled={this.props.disabled}
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
                        <DangerConfirmButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            onClick={() => this.handleStringChangeDeleteButtonClick(d.id)}
                            confirmationMessage="Do you want to discard this change"
                            disabled={this.props.disabled}
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
        const {
            showEditLinkModal,
            editLinkId,
        } = this.state;

        const {
            errorCount = 0,
            warningCount = 0,
            infoCount = 0,
        } = problemCollectionStats;

        if (errorCount + warningCount + infoCount <= 0) {
            return (
                <div className={styles.noProblems}>
                    <Message>
                        Everything looks good.
                    </Message>
                </div>
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
                { showEditLinkModal &&
                    <EditLinkModal
                        editLinkId={editLinkId}
                        onClose={this.handleEditLinkModalClose}
                    />
                }
            </Fragment>
        );
    }
}
