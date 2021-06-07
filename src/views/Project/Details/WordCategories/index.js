import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    categoryEditorListSelector,
    projectDetailsSelector,

    setCategoryEditorsAction,
} from '#redux';
import _ts from '#ts';
import _cs from '#cs';


import WordCategoryListRequest from './requests/WordCategoryListGetRequest';
import WordCategoryDetail from './WordCategoryDetail';
import WordCategoryList from './WordCategoryList';

import styles from './styles.scss';

const propTypes = {
    wordCategoryList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setWordCategoryList: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    wordCategoryList: [],
    readOnly: false,
    className: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    wordCategoryList: categoryEditorListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setWordCategoryList: params => dispatch(setCategoryEditorsAction(params)),
});

const requestForWordCategoryList = memoize((projectId, wordCategoryListRequest) => {
    wordCategoryListRequest
        .init()
        .start();
});

const getActiveWordCategoryId = memoize((
    activeWordCategoryIdFromProject,
    wordCategoryList,
    activeWordCategoryIdFromState,
) => {
    if (activeWordCategoryIdFromState) {
        const previouslyActiveWordCategoryIndex = wordCategoryList.findIndex(
            wc => wc.id === activeWordCategoryIdFromState,
        );

        if (previouslyActiveWordCategoryIndex !== -1) {
            return activeWordCategoryIdFromState;
        }
    }

    let activeWordCategoryId;
    if (activeWordCategoryIdFromProject) {
        activeWordCategoryId = activeWordCategoryIdFromProject;
    } else {
        activeWordCategoryId = wordCategoryList.length > 0 ?
            wordCategoryList[0].id : undefined;
    }

    return activeWordCategoryId;
});


@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectCategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingWordCategoryList: true,
            activeWordCategoryId: undefined,
        };

        this.wordCategoryListRequest = new WordCategoryListRequest({
            setState: d => this.setState(d),
            setWordCategoryList: this.props.setWordCategoryList,
        });
    }

    setActiveWordCategory = (id) => {
        this.setState({ activeWordCategoryId: id });
    }

    handleWordCategoryClick = (id) => {
        this.setActiveWordCategory(id);
    }

    renderActiveWordCategoryDetails = ({ activeWordCategoryId }) => {
        const {
            wordCategoryList,
            readOnly,
        } = this.props;

        if (wordCategoryList.length === 0) {
            return (
                <Message className={styles.noWordCategoryMessage}>
                    { _ts('project.wordCategory', 'noWordCategoryText') }
                </Message>
            );
        }

        return (
            <WordCategoryDetail
                className={styles.details}
                wordCategoryId={activeWordCategoryId}
                setActiveWordCategory={this.setActiveWordCategory}
                readOnly={readOnly}
            />
        );
    }

    render() {
        const {
            pendingWordCategoryList,
            activeWordCategoryId: activeWordCategoryIdFromState,
        } = this.state;

        const {
            wordCategoryList,
            projectDetails: {
                id: projectId,
                categoryEditor: selectedWordCategoryId,
            },
            readOnly,
            className,
        } = this.props;

        requestForWordCategoryList(projectId, this.wordCategoryListRequest);

        const activeWordCategoryId = getActiveWordCategoryId(
            selectedWordCategoryId,
            wordCategoryList,
            activeWordCategoryIdFromState,
        );

        const ActiveWordCategoryDetails = this.renderActiveWordCategoryDetails;

        return (
            <div className={_cs(className, styles.wordCategories)}>
                <WordCategoryList
                    projectId={projectId}
                    className={styles.wordCategoryList}
                    onClick={this.handleWordCategoryClick}
                    activeWordCategoryId={activeWordCategoryId}
                    selectedWordCategoryId={selectedWordCategoryId}
                    wordCategoryList={wordCategoryList}
                    setActiveWordCategory={this.setActiveWordCategory}
                    readOnly={readOnly}
                />
                <div className={styles.details}>
                    { pendingWordCategoryList ? (
                        <LoadingAnimation />
                    ) : (
                        <ActiveWordCategoryDetails
                            activeWordCategoryId={activeWordCategoryId}
                        />
                    )}
                </div>
            </div>
        );
    }
}
