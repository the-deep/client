import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import {
    categoryEditorDocumentsSelector,
    setCeFilesAction,
    ceIdFromRouteSelector,
    categoryEditorProjectsSelector,
} from '#redux';
import DeepGalleryFileSelect from '#components/general/DeepGalleryFileSelect';
import { _cs } from '@togglecorp/fujs';
import _ts from '#ts';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    selectedFiles: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.idRequired,
        title: PropTypes.string,
    })),
    projects: PropTypes.arrayOf(PropTypes.number).isRequired,
    setCeDeepGalleryFiles: PropTypes.func.isRequired,
    categoryEditorId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
    selectedFiles: [],
};

const mapStateToProps = state => ({
    selectedFiles: categoryEditorDocumentsSelector(state),
    categoryEditorId: ceIdFromRouteSelector(state),
    projects: categoryEditorProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCeDeepGalleryFiles: params => dispatch(setCeFilesAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class DocumentSelect extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: props.selectedFiles,
            pending: false,
            pristine: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({
                selectedFiles: nextProps.selectedFiles,
                pending: false,
                pristine: false,
            });
        }
    }

    handleModalClose = (galleryFiles = []) => {
        const { selectedFiles } = this.state;
        const newSelectedFiles = galleryFiles.filter(file => (
            selectedFiles.findIndex(f => file.id === f.id) === -1
        ));

        if (newSelectedFiles.length) {
            this.setState({
                selectedFiles: selectedFiles.concat(newSelectedFiles),
                pristine: true,
            });
        }
    }

    handleRemoveFiles = (id) => {
        const { selectedFiles } = this.state;
        const index = selectedFiles.findIndex(file => file.id === id);
        if (index !== -1) {
            const newSelectedFiles = [...selectedFiles];
            newSelectedFiles.splice(index, 1);
            this.setState({
                selectedFiles: newSelectedFiles,
                pristine: true,
            });
        }
    }

    handleApply = () => {
        const { categoryEditorId } = this.props;
        const { selectedFiles } = this.state;
        this.props.setCeDeepGalleryFiles({
            files: selectedFiles,
            categoryEditorId,
        });
    }

    keySelectorForGalleryFiles = file => file.id

    renderGalleryFilesListItem = (fileId, file) => (
        <div
            className={styles.fileListItem}
            key={fileId}
        >
            <span className={styles.title} >
                {file.title}
            </span>
            <DangerConfirmButton
                className={styles.icon}
                onClick={() => this.handleRemoveFiles(fileId)}
                transparent
                iconName="delete"
                // FIXME: use strings
                title="Remove document"
                // FIXME: use strings
                confirmationMessage="Are you sure you want to remove this document?"
            />
        </div>
    );

    render() {
        const {
            className,
            projects,
        } = this.props;

        const {
            pending,
            pristine,
            selectedFiles,
        } = this.state;

        return (
            <div className={_cs(styles.documentTab, className)}>
                <ListView
                    className={styles.fileListView}
                    modifier={this.renderGalleryFilesListItem}
                    data={selectedFiles}
                    keySelector={this.keySelectorForGalleryFiles}
                />
                <div className={styles.bottomBar}>
                    <ModalButton
                        className={styles.button}
                        onClose={this.handleModalClose}
                        modal={
                            <DeepGalleryFileSelect
                                projects={projects}
                            />
                        }
                    >
                        {_ts('categoryEditor', 'selectFromGalleryButtonLabel')}
                    </ModalButton>
                    <PrimaryButton
                        className={styles.button}
                        onClick={this.handleApply}
                        disabled={pending || !pristine}
                    >
                        {_ts('categoryEditor', 'applyButtonLabel')}
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}
