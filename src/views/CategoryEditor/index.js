import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import Page from '#rscv/Page';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { FgRestBuilder } from '#rsu/rest';
import {
    checkVersion,
    isTruthy,
    randomString,
    splitInWhitespace,
    trimWhitespace,
} from '@togglecorp/fujs';

import {
    categoryEditorViewTitleSelector,
    categoryEditorViewVersionIdSelector,
    categoryEditorViewPristineSelector,
    categoriesSelector,
    activeCategoryIdSelector,

    addNewCategoryAction,
    removeCategoryAction,
    setCategoryAction,

    setActiveCategoryIdAction,
    addNewSubcategoryAction,
    updateSelectedSubcategoriesAction,
    addSubcategoryNGramAction,
    addManualSubcategoryNGramAction,
    setCategoryEditorAction,

    ceIdFromRouteSelector,
    activeProjectIdFromStateSelector,
} from '#redux';
import {
    createUrlForCategoryEditor,
    createParamsForGet,
    createParamsForCeViewPatch,
    transformResponseErrorToFormError,
} from '#rest';
import { iconNames } from '#constants';
import schema from '#schema';
import notify from '#notify';
import _ts from '#ts';

import DocumentPanel from './DocumentPanel';
import NewCategoryModal from './NewCategoryModal';
import NewManualNgramModal from './NewManualNgramModal';
import NewSubcategoryModal from './NewSubcategoryModal';
import SubcategoryColumn from './SubcategoryColumn';
import SubcategoryPropertyPanel from './SubcategoryPropertyPanel';
import TitleBar from './TitleBar';

import styles from './styles.scss';

const mapStateToProps = state => ({
    categoryEditorViewTitle: categoryEditorViewTitleSelector(state),
    categoryEditorViewVersionId: categoryEditorViewVersionIdSelector(state),
    categoryEditorViewPristine: categoryEditorViewPristineSelector(state),

    categories: categoriesSelector(state),
    activeCategoryId: activeCategoryIdSelector(state),

    categoryEditorId: ceIdFromRouteSelector(state),
    projectId: activeProjectIdFromStateSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addNewCategory: params => dispatch(addNewCategoryAction(params)),
    setCategory: params => dispatch(setCategoryAction(params)),
    removeCategory: params => dispatch(removeCategoryAction(params)),

    setActiveCategoryId: params => dispatch(setActiveCategoryIdAction(params)),
    addNewSubcategory: params => dispatch(addNewSubcategoryAction(params)),
    updateSelectedSubcategories: params => dispatch(updateSelectedSubcategoriesAction(params)),
    addSubcategoryNGram: params => dispatch(addSubcategoryNGramAction(params)),
    addManualSubcategoryNGram: params => dispatch(addManualSubcategoryNGramAction(params)),
    setCategoryEditor: params => dispatch(setCategoryEditorAction(params)),
});

const propTypes = {
    categoryEditorViewTitle: PropTypes.string.isRequired,
    categoryEditorViewVersionId: PropTypes.number,
    categoryEditorViewPristine: PropTypes.bool,

    categories: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activeCategoryId: PropTypes.string,

    setCategory: PropTypes.func.isRequired,
    removeCategory: PropTypes.func.isRequired,
    addNewCategory: PropTypes.func.isRequired,
    setActiveCategoryId: PropTypes.func.isRequired,
    addNewSubcategory: PropTypes.func.isRequired,
    updateSelectedSubcategories: PropTypes.func.isRequired,
    addSubcategoryNGram: PropTypes.func.isRequired,
    addManualSubcategoryNGram: PropTypes.func.isRequired,
    setCategoryEditor: PropTypes.func.isRequired,

    categoryEditorId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
    activeCategoryId: undefined,
    categoryEditorViewVersionId: undefined,
    categoryEditorViewPristine: undefined,
};

const DEPTH_LIMIT = 5;

@connect(mapStateToProps, mapDispatchToProps)
export default class CategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static categoryKeySelector = d => d.id;
    static categoryLabelSelector = d => d.title;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,

            showNewCategoryModal: false,
            showEditCategoryModal: false,
            showNewSubcategoryModal: false,
            showNewManualNGramModal: false,
        };
    }

    componentWillMount() {
        const { categoryEditorId } = this.props;
        this.ceRequest = this.createCeRequest(categoryEditorId);
        this.ceRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { categoryEditorId: oldCategoryEditorId } = this.props;
        const { categoryEditorId: newCategoryEditorId } = nextProps;
        if (oldCategoryEditorId !== newCategoryEditorId) {
            this.ceRequest.stop();
            this.ceRequest = this.createCeRequest(newCategoryEditorId);
            this.ceRequest.start();
        }
    }

    componentWillUnmount() {
        this.ceRequest.stop();
    }

    // REST

    createCeRequest = (categoryEditorId) => {
        const cesRequest = new FgRestBuilder()
            .url(createUrlForCategoryEditor(categoryEditorId))
            .params(createParamsForGet)
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditor');

                    const { categoryEditorViewVersionId } = this.props;

                    const {
                        shouldSetValue,
                        isValueOverriden,
                    } = checkVersion(categoryEditorViewVersionId, response.versionId);

                    if (shouldSetValue) {
                        this.props.setCategoryEditor({ categoryEditor: response });
                    }
                    if (isValueOverriden) {
                        notify.send({
                            type: notify.type.WARNING,
                            title: _ts('categoryEditor', 'ceUpdate'),
                            message: _ts('categoryEditor', 'ceUpdateOverridden'),
                            duration: notify.duration.SLOW,
                        });
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return cesRequest;
    };

    createCeSaveRequest = ({ categoryEditorId, categoryEditor }) => {
        const cesRequest = new FgRestBuilder()
            .url(createUrlForCategoryEditor(categoryEditorId))
            .params(() => createParamsForCeViewPatch({ data: categoryEditor }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditor');
                    this.props.setCategoryEditor({
                        categoryEditor: response,
                    });

                    notify.send({
                        title: 'Category Editor', // FIXME: write
                        type: notify.type.SUCCESS,
                        message: 'Category Editor saved successfully',
                        duration: notify.duration.SLOW,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                // FIXME: transformResponse to alterResponse
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: 'Category Editor', // FIXME: write
                    type: notify.type.ERROR,
                    message, // FIXME: write
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Category Editor', // FIXME: write
                    type: notify.type.ERROR,
                    message: 'Save unsuccessful', // FIXME: write
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return cesRequest;
    };

    handleCategoryEditorSaveButtonClick = () => {
        if (this.saveCeRequest) {
            this.saveCeRequest.stop();
        }

        const { activeCategoryId, categories } = this.props;
        this.saveCeRequest = this.createCeSaveRequest({
            categoryEditorId: this.props.categoryEditorId,
            categoryEditor: {
                activeCategoryId,
                categories,
            },
        });

        this.saveCeRequest.start();
    }

    // SUBCATEGORY DROP & CLICK

    handleSubcategoryDrop = (level, subcategoryId, data) => {
        const { addSubcategoryNGram } = this.props;
        try {
            const ngram = JSON.parse(data);
            addSubcategoryNGram({
                categoryEditorId: this.props.categoryEditorId,
                level,
                subcategoryId,
                ngram,
            });
        } catch (ex) {
            notify.send({
                type: notify.type.WARNING,
                title: _ts('categoryEditor', 'invalidDropSource'),
                message: _ts('categoryEditor', 'validDropAlert'),
            });
        }
    }

    handleSubcategoryClick = (level, subcategoryId) => {
        const { updateSelectedSubcategories } = this.props;
        updateSelectedSubcategories({
            categoryEditorId: this.props.categoryEditorId,
            level,
            subcategoryId,
        });
    }

    // SELECT INPUT

    handleCategorySelectChange = (value) => {
        const { setActiveCategoryId } = this.props;
        setActiveCategoryId({
            categoryEditorId: this.props.categoryEditorId,
            id: value,
        });
    }

    handleRemoveCategory = () => {
        this.props.removeCategory({
            categoryEditorId: this.props.categoryEditorId,
            id: this.props.activeCategoryId,
        });
    }

    addNewCategory = (title) => {
        const key = randomString();
        const newCategory = {
            categoryEditorId: this.props.categoryEditorId,
            id: key,
            title,
        };
        this.props.addNewCategory(newCategory);
    }

    editCategory = (title) => {
        const newCategory = {
            categoryEditorId: this.props.categoryEditorId,
            id: this.props.activeCategoryId,
            values: { title },
        };
        this.props.setCategory(newCategory);
    }

    addNewSubcategory = ({ title, description }) => {
        const { newSubcategoryLevel: level } = this;
        const id = randomString();
        this.props.addNewSubcategory({
            categoryEditorId: this.props.categoryEditorId,
            level,
            id,
            title,
            description,
        });
    }

    addNewManualNgram = (keyword) => {
        const n = splitInWhitespace(keyword).length;
        const sanitizedKeyword = trimWhitespace(keyword);
        this.props.addManualSubcategoryNGram({
            categoryEditorId: this.props.categoryEditorId,
            ngram: {
                n,
                keyword: sanitizedKeyword,
            },
        });
    }

    // MODAL OPENERS

    handleNewCategory = () => {
        this.setState({ showNewCategoryModal: true });
    }

    handleEditCategory = () => {
        this.setState({ showEditCategoryModal: true });
    }

    handleNewSubcategory = (level) => {
        this.newSubcategoryLevel = level;
        this.setState({ showNewSubcategoryModal: true });
    }

    handleNewManualNGram = () => {
        this.setState({ showNewManualNGramModal: true });
    };

    // MODAL SUBMIT

    handleNewCategoryModalSubmit = (val) => {
        this.setState({ showNewCategoryModal: false });
        this.addNewCategory(val);
    }

    handleEditCategoryModalSubmit = (val) => {
        this.setState({ showEditCategoryModal: false });
        this.editCategory(val);
    }

    handleNewSubcategoryModalSubmit = (val) => {
        this.setState({ showNewSubcategoryModal: false });
        this.addNewSubcategory(val);
    }

    handleNewManualNgramModalSubmit = (val) => {
        this.setState({ showNewManualNGramModal: false });
        this.addNewManualNgram(val);
    }

    // MODAL CLOSE

    handleNewCategoryModalClose = () => {
        this.setState({ showNewCategoryModal: false });
    }

    handleEditCategoryModalClose = () => {
        this.setState({ showEditCategoryModal: false });
    }

    handleNewSubcategoryModalClose = () => {
        this.setState({ showNewSubcategoryModal: false });
    }

    handleNewManualNgramModalClose = () => {
        this.setState({ showNewManualNGramModal: false });
    }


    // RENDER

    renderSubcategoryColumns = () => {
        const {
            categories,
            activeCategoryId,
        } = this.props;

        const category = categories.find(d => d.id === activeCategoryId);
        const { selectedSubcategories } = category;

        let nextSubcategory = category;
        const subcategoryColumns = selectedSubcategories.map((selected, i) => {
            const isLastColumn = i === selectedSubcategories.length - 1;

            const subcategoryIndex = nextSubcategory.subcategories.findIndex(
                d => d.id === selected,
            );
            const currentSubcategories = nextSubcategory.subcategories;
            const currentSubcategoryTitle = nextSubcategory.title;

            nextSubcategory = currentSubcategories[subcategoryIndex];
            return (
                <SubcategoryColumn
                    key={selected}
                    level={i}
                    isLastColumn={isLastColumn}
                    className={styles.column}
                    selectedSubcategoryId={selected}
                    subcategories={currentSubcategories}
                    title={currentSubcategoryTitle}
                    onNewSubcategory={this.handleNewSubcategory}
                    onSubcategoryClick={this.handleSubcategoryClick}
                    onDrop={this.handleSubcategoryDrop}
                />
            );
        });

        if (selectedSubcategories.length < DEPTH_LIMIT) {
            const currentSubcategories = nextSubcategory.subcategories;
            const currentSubcategoryTitle = nextSubcategory.title;
            subcategoryColumns.push(
                <SubcategoryColumn
                    level={selectedSubcategories.length}
                    key="empty"
                    className={styles.column}
                    subcategories={currentSubcategories}
                    title={currentSubcategoryTitle}
                    onNewSubcategory={this.handleNewSubcategory}
                    onSubcategoryClick={this.handleSubcategoryClick}
                    onDrop={this.handleSubcategoryDrop}
                />,
            );
        }

        return subcategoryColumns;
    }

    render() {
        const {
            categories,
            activeCategoryId,
            categoryEditorViewPristine,
            categoryEditorViewTitle,
            projectId,
        } = this.props;

        const {
            pending,
            showNewCategoryModal,
            showEditCategoryModal,
            showNewSubcategoryModal,
            showNewManualNGramModal,
        } = this.state;

        const activeCategory = categories.find(cat => cat.id === activeCategoryId);
        const confirmMessage = activeCategory
            && _ts('categoryEditor', 'confirmTextDeleteCategory', {
                category: (<b>{activeCategory.title}</b>),
            });

        return (
            <React.Fragment>
                <Page
                    className={styles.categoryEditor}
                    header={
                        <TitleBar
                            title={categoryEditorViewTitle}
                            saveButtonDisabled={categoryEditorViewPristine || pending}
                            onSaveButtonClick={this.handleCategoryEditorSaveButtonClick}
                            projectId={projectId}
                        />
                    }
                    mainContentClassName={styles.mainContent}
                    mainContent={
                        <React.Fragment>
                            { pending && <LoadingAnimation /> }
                            <div className={styles.left}>
                                <DocumentPanel className={styles.documentPanel} />
                            </div>
                            <div className={styles.right}>
                                <header className={styles.header}>
                                    <TextInput
                                        label={_ts('categoryEditor', 'titleInputTitle')}
                                        placeholder={_ts('categoryEditor', 'titleInputPlaceholder')}
                                        className={styles.titleInput}
                                    />
                                    <div className={styles.categorySelectContainer}>
                                        <SelectInput
                                            label={_ts('categoryEditor', 'headerCategoryLabel')}
                                            className={styles.categorySelectInput}
                                            options={categories}
                                            onChange={this.handleCategorySelectChange}
                                            placeholder={_ts('categoryEditor', 'selectCategoryPlaceholder')}
                                            value={activeCategoryId}
                                            keySelector={CategoryEditor.categoryKeySelector}
                                            labelSelector={CategoryEditor.categoryLabelSelector}
                                            hideClearButton
                                            disabled={pending}
                                        />
                                        <div className={styles.actionButtons}>
                                            <PrimaryButton
                                                onClick={this.handleNewCategory}
                                                disabled={pending}
                                                iconName={iconNames.add}
                                                title={_ts('categoryEditor', 'addCategoryTooltip')}
                                            />
                                            { isTruthy(activeCategoryId) && (
                                                <Fragment>
                                                    <PrimaryButton
                                                        onClick={this.handleEditCategory}
                                                        disabled={pending}
                                                        iconName={iconNames.edit}
                                                        title={_ts('categoryEditor', 'editCategoryTooltip')}
                                                    />
                                                    <DangerConfirmButton
                                                        onClick={this.handleRemoveCategory}
                                                        disabled={pending}
                                                        iconName={iconNames.delete}
                                                        title={_ts('categoryEditor', 'deleteCategoryTooltip')}
                                                        confirmationMessage={confirmMessage}
                                                    />
                                                </Fragment>
                                            )}
                                        </div>
                                    </div>
                                </header>
                                <div className={styles.content}>
                                    <div className={styles.subCategories}>
                                        {
                                            activeCategoryId ? (
                                                this.renderSubcategoryColumns()
                                            ) : (
                                                <p className={styles.empty}>
                                                    {_ts('categoryEditor', 'nothingHereText')}
                                                </p>
                                            )
                                        }
                                    </div>
                                    <SubcategoryPropertyPanel
                                        onNewManualNGram={this.handleNewManualNGram}
                                    />
                                </div>
                            </div>
                        </React.Fragment>
                    }
                />
                <Prompt
                    when={!categoryEditorViewPristine}
                    message={_ts('common', 'youHaveUnsavedChanges')}
                />
                { showNewCategoryModal && (
                    <NewCategoryModal
                        onSubmit={this.handleNewCategoryModalSubmit}
                        onClose={this.handleNewCategoryModalClose}
                    />
                ) }
                { showEditCategoryModal && (
                    <NewCategoryModal
                        editMode
                        initialValue={activeCategory}
                        onSubmit={this.handleEditCategoryModalSubmit}
                        onClose={this.handleEditCategoryModalClose}
                    />
                ) }
                { showNewSubcategoryModal && (
                    <NewSubcategoryModal
                        onSubmit={this.handleNewSubcategoryModalSubmit}
                        onClose={this.handleNewSubcategoryModalClose}
                    />
                ) }
                { showNewManualNGramModal && (
                    <NewManualNgramModal
                        onSubmit={this.handleNewManualNgramModalSubmit}
                        onClose={this.handleNewManualNgramModalClose}
                    />
                ) }
            </React.Fragment>
        );
    }
}
