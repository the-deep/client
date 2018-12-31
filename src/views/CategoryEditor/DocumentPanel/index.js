import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    categoryEditorDocumentsSelector,
    categoryEditorSimplifiedPreviewIdSelector,
    setCeNgramsAction,
    setCeSimplifiedPreviewIdAction,
    ceIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';
import SimplifiedFilePreview from '#components/SimplifiedFilePreview';
import _cs from '#cs';

import DocumentNGram from './DocumentNGram';
import DocumentSelect from './DocumentSelect';

import styles from './styles.scss';

const propTypes = {
    previewId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setCeNgrams: PropTypes.func.isRequired,
    setPreviewId: PropTypes.func.isRequired,
    selectedFiles: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
    })),
    categoryEditorId: PropTypes.number.isRequired,
};

const defaultProps = {
    previewId: undefined,
    selectedFiles: [],
};

const mapStateToProps = state => ({
    selectedFiles: categoryEditorDocumentsSelector(state),
    previewId: categoryEditorSimplifiedPreviewIdSelector(state),

    categoryEditorId: ceIdFromRouteSelector(state),
});


const mapDispatchToProps = dispatch => ({
    setPreviewId: params => dispatch(setCeSimplifiedPreviewIdAction(params)),
    setCeNgrams: params => dispatch(setCeNgramsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class DocumentPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            selectedFiles: [],
            fileIds: props.selectedFiles.map(file => file.id),
            activeTabIndex: 0,
        };

        this.tabs = [
            {
                key: 'document',
                title: _ts('categoryEditor', 'documentTabLabel'),
            },
            {
                key: 'simplified',
                title: _ts('categoryEditor', 'simplifiedTabLabel'),
            },
            {
                key: 'ngrams',
                title: _ts('categoryEditor', 'ngramsTabLabel'),
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedFiles !== nextProps.selectedFiles) {
            this.setState({
                fileIds: nextProps.selectedFiles.map(file => file.id),
            });
        }
    }

    getTabClassName = (base, i) => {
        const { activeTabIndex } = this.state;
        return _cs(
            base,
            activeTabIndex === i && styles.active,
        );
    }

    getTabHeaderClassName = i => this.getTabClassName(styles.tabHeader, i)
    getTabContentClassName = i => this.getTabClassName(styles.tabContent, i)

    // Simplification callback
    handleFilesPreviewLoad = (response) => {
        const { categoryEditorId } = this.props;

        this.props.setPreviewId({
            categoryEditorId,
            previewId: response.id,
        });

        this.props.setCeNgrams({
            categoryEditorId,
            ngrams: response.ngrams,
        });
    }

    handlePreLoad = () => {
        this.setState({
            pending: true,
        });
    }

    handlePostLoad = () => {
        this.setState({ pending: false });
    }

    // Document Select Callback
    handleModalClose = (galleryFiles) => {
        const { selectedFiles } = this.state;
        const newSelectedFiles = galleryFiles.filter(file => (
            selectedFiles.findIndex(f => f.id === file.id) === -1
        ));

        this.setState({
            selectedFiles: selectedFiles.concat(newSelectedFiles),
        });
    }

    // Remove file callback
    handleRemoveFiles = (id) => {
        const newSelectedFiles = [...this.state.selectedFiles];
        const index = newSelectedFiles.findIndex(file => file.id === id);
        if (index !== -1) {
            newSelectedFiles.splice(index, 1);
            this.setState({
                selectedFiles: newSelectedFiles,
            });
        }
    }

    handleTabHeaderClick = (i) => {
        this.setState({
            activeTabIndex: i,
        });
    }

    keySelectorForGalleryFiles = file => file.id
    keySelectorForTabs = d => d.key

    renderTabHeader = (key, data, i) => (
        <button
            key={key}
            className={this.getTabHeaderClassName(i)}
            onClick={() => { this.handleTabHeaderClick(i); }}
        >
            { data.title }
        </button>
    )

    render() {
        const {
            pending,
            fileIds,
        } = this.state;

        const { previewId } = this.props;

        return (
            <div className={styles.documentPanel}>
                <header className={styles.header}>
                    <List
                        data={this.tabs}
                        keySelector={this.keySelectorForTabs}
                        modifier={this.renderTabHeader}
                    />
                </header>
                <div className={styles.content}>
                    { pending && <LoadingAnimation /> }
                    <div className={`${styles.tabContent} ${this.getTabContentClassName(0)}`}>
                        <DocumentSelect className={styles.documentTab} />
                    </div>
                    <div className={`${styles.tabContent} ${this.getTabContentClassName(1)}`}>
                        <SimplifiedFilePreview
                            fileIds={fileIds}
                            previewId={previewId}
                            onLoad={this.handleFilesPreviewLoad}
                            preLoad={this.handlePreLoad}
                            postLoad={this.handlePostLoad}
                        />
                    </div>
                    <div className={`${styles.tabContent} ${this.getTabContentClassName(2)}`}>
                        <DocumentNGram className={styles.ngramsTab} />
                    </div>
                </div>
            </div>
        );
    }
}
