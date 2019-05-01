import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    caseInsensitiveSubmatch,
    compareString,
    compareStringSearch,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import ListItem from '#rscv/List/ListItem';

import _ts from '#ts';

import AddWordCategoryButton from './AddWordCategoryButton';
import styles from './styles.scss';

const propTypes = {
    activeWordCategoryId: PropTypes.number.isRequired,
    className: PropTypes.string,
    wordCategoryList: PropTypes.arrayOf(PropTypes.object),
    onClick: PropTypes.func.isRequired,
    selectedWordCategoryId: PropTypes.number,
    projectId: PropTypes.number.isRequired,
    setActiveWordCategory: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    wordCategoryList: [],
    readOnly: false,

    // Apparently there can be no wordCategory in projects
    selectedWordCategoryId: undefined,
};

// TODO: move to separate component
const WordCategoryListItem = ({
    className,
    isActive,
    isSelected,
    wordCategory: { title },
    onClick,
}) => (
    <ListItem
        className={className}
        active={isActive}
        onClick={onClick}
    >
        <div className={styles.title}>
            { title }
        </div>
        { isSelected &&
            <Icon
                className={styles.check}
                name="checkCircle"
            />
        }
    </ListItem>
);

WordCategoryListItem.propTypes = {
    className: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    wordCategory: PropTypes.shape({
        title: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
};

WordCategoryListItem.defaultProps = {
    className: '',
};

const filterWordCategories = memoize((wordCategoryList, searchInputValue) => {
    const displayWordCategoryList = wordCategoryList
        .filter(wordCategory => caseInsensitiveSubmatch(wordCategory.title, searchInputValue))
        .sort((a, b) => compareStringSearch(a.title, b.title, searchInputValue));

    displayWordCategoryList.sort(
        (a, b) => compareString(
            a.title,
            b.title,
        ),
    );

    return displayWordCategoryList;
});

const getWordCategoryKey = wordCategory => wordCategory.id;

export default class WordCategoryList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
        };
    }

    handleSearchInputValueChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    }

    itemRendererParams = (key, wordCategory) => ({
        wordCategory,
        isActive: this.props.activeWordCategoryId === wordCategory.id,
        isSelected: this.props.selectedWordCategoryId === wordCategory.id,
        onClick: () => this.props.onClick(wordCategory.id),
        className: styles.item,
    })

    render() {
        const {
            className: classNameFromProps,
            wordCategoryList,
            projectId,
            setActiveWordCategory,
            readOnly,
        } = this.props;

        const { searchInputValue } = this.state;

        if (!wordCategoryList) {
            return null;
        }

        const displayWordCategoryList = filterWordCategories(
            wordCategoryList,
            searchInputValue,
        );

        const className = `
            ${classNameFromProps}
            ${styles.wordCategoryList}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        {_ts('project.wordCategory', 'wordCategoryListHeading')}
                    </h4>
                    <AddWordCategoryButton
                        projectId={projectId}
                        setActiveWordCategory={setActiveWordCategory}
                        disabled={readOnly}
                    />
                    <SearchInput
                        className={styles.wordCategorySearchInput}
                        value={searchInputValue}
                        onChange={this.handleSearchInputValueChange}
                        placeholder={_ts('project.wordCategory', 'searchWordCategoryInputPlaceholder')}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <ListView
                    data={displayWordCategoryList}
                    className={styles.content}
                    renderer={WordCategoryListItem}
                    rendererParams={this.itemRendererParams}
                    keySelector={getWordCategoryKey}
                />
            </div>
        );
    }
}
