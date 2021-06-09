import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { bound } from '@togglecorp/fujs';
import ListView from '#rscv/List/ListView';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';


import _ts from '#ts';
import _cs from '#cs';
import {
    selectedSubcategorySelector,
    updateSelectedSubcategoryAction,
    removeSelectedSubcategoryAction,
    removeSubcategoryNGramAction,
    ceIdFromRouteSelector,
} from '#redux';

import styles from './styles.scss';
import NGram from './NGram';

const propTypes = {
    subcategory: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    updateSelectedSubcategory: PropTypes.func.isRequired,
    removeSelectedSubcategory: PropTypes.func.isRequired,
    removeSubcategoryNGram: PropTypes.func.isRequired,
    onNewManualNGram: PropTypes.func.isRequired,
    categoryEditorId: PropTypes.number.isRequired,
};

const defaultProps = {
    subcategory: undefined,
};

const mapStateToProps = state => ({
    subcategory: selectedSubcategorySelector(state),
    categoryEditorId: ceIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateSelectedSubcategory: params => dispatch(updateSelectedSubcategoryAction(params)),
    removeSelectedSubcategory: params => dispatch(removeSelectedSubcategoryAction(params)),
    removeSubcategoryNGram: params => dispatch(removeSubcategoryNGramAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class SubcategoryPropertyPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getNgramKeys = (subcategory) => {
        if (!subcategory) {
            return [];
        }
        return Object.keys(subcategory.ngrams).filter(
            key => subcategory.ngrams[key].length > 0,
        );
    }

    constructor(props) {
        super(props);

        const { subcategory } = this.props;
        const ngramKeys = SubcategoryPropertyPanel.getNgramKeys(subcategory);
        this.state = {
            selectedNGramIndex: 0,
            ngramKeys,

            // confirmText: '',
            // deleteSubCategory: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { subcategory: oldSubcategory } = this.props;
        const { subcategory: newSubcategory } = nextProps;

        if (oldSubcategory !== newSubcategory &&
            (!oldSubcategory || !newSubcategory ||
                oldSubcategory.ngram !== newSubcategory.ngrams)
        ) {
            const ngramKeys = SubcategoryPropertyPanel.getNgramKeys(newSubcategory);
            const selectedNGramIndex = bound(
                this.state.selectedNGramIndex,
                ngramKeys.length - 1,
                0,
            );
            this.setState({
                ngramKeys,
                selectedNGramIndex,
            });
        }
    }

    getNGramSelectStyleName = (i) => {
        const { selectedNGramIndex } = this.state;

        return _cs(
            styles.ngramSelect,
            selectedNGramIndex === i && styles.active,
        );
    }

    handleNGramSelectButtonClick = (i) => {
        this.setState({ selectedNGramIndex: i });
    }

    handleSubcategoryTitleInputChange = (value) => {
        const {
            subcategory,
            updateSelectedSubcategory,
        } = this.props;

        updateSelectedSubcategory({
            ...subcategory,
            categoryEditorId: this.props.categoryEditorId,
            title: value,
        });
    };

    handleSubcategoryDescriptionInputChange = (value) => {
        const {
            subcategory,
            updateSelectedSubcategory,
        } = this.props;

        updateSelectedSubcategory({
            ...subcategory,
            categoryEditorId: this.props.categoryEditorId,
            description: value,
        });
    };

    handleSubcategoryRemove = () => {
        this.props.removeSelectedSubcategory({
            categoryEditorId: this.props.categoryEditorId,
        });
    }

    handleNgramRemove = (ngram) => {
        this.props.removeSubcategoryNGram({
            categoryEditorId: this.props.categoryEditorId,
            ngram,
        });
    }

    handleDelete = (keyword) => {
        const { ngramKeys, selectedNGramIndex } = this.state;
        const n = ngramKeys[selectedNGramIndex];
        this.handleNgramRemove({ n, keyword });
    }

    renderNGramSelect = (key, data, i) => (
        <button
            className={this.getNGramSelectStyleName(i)}
            key={key}
            onClick={() => { this.handleNGramSelectButtonClick(i); }}
            type="button"
        >
            {key}
        </button>
    )

    render() {
        const {
            subcategory,
            onNewManualNGram,
        } = this.props;
        const {
            selectedNGramIndex,
            ngramKeys,
            //  deleteSubCategory,
            // confirmText,
        } = this.state;

        if (!subcategory) {
            return (
                <div className={styles.propertyPanel}>
                    <p className={styles.empty}>
                        {_ts('categoryEditor', 'nothingHereText')}
                    </p>
                </div>
            );
        }

        const {
            ngrams,
            title,
            description,
        } = subcategory;

        const keywords = ngrams[ngramKeys[selectedNGramIndex]];

        const confirmMessage = _ts('categoryEditor', 'confirmTextDeleteSubCategory', {
            subcategory: (<b>{subcategory.title}</b>),
        });

        return (
            <div className={styles.propertyPanel} >
                <header className={styles.header} >
                    <h3 className={styles.heading} >
                        {_ts('categoryEditor', 'subCategoryDetailsText')}
                    </h3>
                    <div className={styles.actionButtons}>
                        <DangerConfirmButton
                            onClick={this.handleSubcategoryRemove}
                            confirmationMessage={confirmMessage}
                            title={_ts('categoryEditor', 'removeCategoryButtonLabel')}
                            iconName="delete"
                        />
                    </div>
                </header>
                <section className={styles.properties} >
                    <TextInput
                        label={_ts('categoryEditor', 'subCategoryTitleLabel')}
                        placeholder={_ts('categoryEditor', 'subCategoryTitlePlaceholder')}
                        value={title}
                        onChange={this.handleSubcategoryTitleInputChange}
                    />
                    <TextArea
                        label={_ts('categoryEditor', 'subCategoryDescriptionLabel')}
                        placeholder={_ts('categoryEditor', 'subCategoryDescriptionPlaceholder')}
                        value={description}
                        onChange={this.handleSubcategoryDescriptionInputChange}
                    />
                </section>
                <section className={styles.ngrams} >
                    <div className={styles.ngramSelects}>
                        {
                            (ngramKeys.length > 0) && (
                                <h4 className={styles.heading}>
                                    {_ts('categoryEditor', 'numberOfWordsLabel')}
                                </h4>
                            )
                        }
                        <ListView
                            className={styles.ngramSelectList}
                            data={ngramKeys}
                            modifier={this.renderNGramSelect}
                            keySelector={d => d}
                        />
                    </div>
                    {
                        (ngramKeys.length > 0) ? (
                            <NGram
                                className={styles.ngram}
                                keywords={keywords}
                                onDelete={this.handleDelete}
                            />
                        ) : (
                            <div className={styles.empty}>
                                {_ts('categoryEditor', 'noWordsText')}
                            </div>
                        )
                    }
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            onClick={onNewManualNGram}
                        >
                            {_ts('categoryEditor', 'addWordManuallyButtonLabel')}
                        </PrimaryButton>
                    </div>
                </section>
            </div>
        );
    }
}
