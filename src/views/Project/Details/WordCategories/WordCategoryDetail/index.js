import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import { reverseRoute } from '#rsu/common';

import {
    wordCategoryDetailSelector,
    projectDetailsSelector,

    setProjectCeAction,
    addNewCeAction,
} from '#redux';
import _ts from '#ts';
import { pathNames } from '#constants';

import CloneWordCategoryButton from './CloneWordCategoryButton';
import UseWordCategoryButton from './UseWordCategoryButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    wordCategory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addNewWordCategory: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectWordCategory: PropTypes.func.isRequired,
    setActiveWordCategory: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    readOnly: false,
};

const mapStateToProps = (state, props) => ({
    wordCategory: wordCategoryDetailSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewWordCategory: params => dispatch(addNewCeAction(params)),
    setProjectWordCategory: params => dispatch(setProjectCeAction(params)),
});

// TODO: use this request to get wordCategory instead from the redux
const requestWordCategory = memoize((wordCategoryId, wordCategoryGetRequest) => {
    wordCategoryGetRequest.stop();
    wordCategoryGetRequest
        .init(wordCategoryId)
        .start();
});

@connect(mapStateToProps, mapDispatchToProps)
export default class WordCategoryDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {};
    }

    renderEditWordCategoryButton = () => {
        const {
            wordCategory: {
                id: wordCategoryId,
                isAdmin: isWordCategoryAdmin,
            },
        } = this.props;

        if (!isWordCategoryAdmin) {
            return null;
        }

        const params = { categoryEditorId: wordCategoryId };

        return (
            <Link
                className={styles.editCategoryEditorLink}
                to={reverseRoute(pathNames.categoryEditor, params)}
            >
                { _ts('project.wordCategory', 'editWordCategoryButtonTitle') }
            </Link>
        );
    }

    renderHeader = () => {
        const {
            wordCategory: {
                id: wordCategoryId,
                title: wordCategoryTitle,
            },
            projectDetails: {
                categoryEditor: currentWordCategoryId,
                id: projectId,
            },
            setProjectWordCategory,
            addNewWordCategory,
            setActiveWordCategory,
            readOnly,
        } = this.props;

        const { pending } = this.state;

        const EditWordCategoryButton = this.renderEditWordCategoryButton;

        return (
            <header className={styles.header}>
                <h2
                    title={wordCategoryTitle}
                    className={styles.heading}
                >
                    {wordCategoryTitle}
                </h2>
                <div className={styles.actionButtons}>
                    <UseWordCategoryButton
                        currentWordCategoryId={currentWordCategoryId}
                        disabled={pending || readOnly}
                        wordCategoryId={wordCategoryId}
                        wordCategoryTitle={wordCategoryTitle}
                        projectId={projectId}
                        setProjectWordCategory={setProjectWordCategory}
                    />
                    <EditWordCategoryButton />
                    <CloneWordCategoryButton
                        addNewWordCategory={addNewWordCategory}
                        disabled={pending || readOnly}
                        projectId={projectId}
                        setActiveWordCategory={setActiveWordCategory}
                        wordCategoryId={wordCategoryId}
                    />
                </div>
            </header>
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.wordCategoryDetail}
        `;

        const Header = this.renderHeader;

        return (
            <div className={className}>
                <Header />
                {/* TODO: Add details */}
            </div>
        );
    }
}
