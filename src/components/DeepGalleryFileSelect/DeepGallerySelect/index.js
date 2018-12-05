import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';

import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import FileInput from '#rsci/FileInput';
import SearchInput from '#rsci/SearchInput';
import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import Table from '#rscv/Table';
import {
    caseInsensitiveSubmatch,
    compareString,
    compareDate,
} from '#rsu/common';
import { UploadBuilder } from '#rsu/upload';

import { iconNames } from '#constants';
import { leadTypeIconMap } from '#entities/lead';
import {
    userGalleryFilesSelector,
    setUserGalleryFilesAction,
} from '#redux';
import {
    urlForUpload,
    createParamsForFileUpload,
    transformAndCombineResponseErrors,
} from '#rest';
import _ts from '#ts';

import UserGalleryFilesRequest from './requests/UserGalleryFilesRequest';

import styles from './styles.scss';

const propTypes = {
    projects: PropTypes.arrayOf(PropTypes.number),
    onClose: PropTypes.func.isRequired,

    setUserGalleryFiles: PropTypes.func.isRequired,
    galleryFiles: PropTypes.arrayOf(
        PropTypes.shape({}),
    ),
};

const defaultProps = {
    projects: undefined,
    galleryFiles: [],
};

const mapStateToProps = state => ({
    galleryFiles: userGalleryFilesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGalleryFiles: params => dispatch(setUserGalleryFilesAction(params)),
});

/*
 * Deep Gallery Files Selector Component
 *
 */
@connect(mapStateToProps, mapDispatchToProps)
export default class DgSelect extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.galleryFilesHeader = [
            {
                key: 'actions',
                label: _ts('components.deepGallerySelect', 'tableHeaderSelect'),
                order: 1,
                modifier: row => this.renderCheckbox(row),
            },
            {
                key: 'mimeType',
                label: _ts('components.deepGallerySelect', 'tableHeaderType'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.mimeType, b.mimeType),
                modifier: row => this.renderGalleryFileType(row),
            },
            {
                key: 'title',
                label: _ts('components.deepGallerySelect', 'tableHeaderName'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: _ts('components.deepGallerySelect', 'tableHeaderDateCreated'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.createdAt, b.createdAt),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];

        this.defaultSort = {
            key: 'createdAt',
            order: 'dsc',
        };

        this.state = {
            pending: true,
            selected: [],
            searchInputValue: undefined,
        };

        this.userGalleryFilesRequest = new UserGalleryFilesRequest({
            setState: params => this.setState(params),
            setUserGalleryFiles: this.props.setUserGalleryFiles,
        });
    }

    componentDidMount() {
        const { projects } = this.props;
        this.userGalleryFilesRequest.init({ projects }).start();
    }

    componentWillReceiveProps(nextProps) {
        const { projects: oldProjects } = this.props;
        const { projects: newProjects } = nextProps;
        if (oldProjects !== newProjects) {
            this.userGalleryFilesRequest.init({ projects: newProjects }).start();
        }
    }

    componentWillUnmount() {
        this.userGalleryFilesRequest.stop();
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    onClose = () => {
        this.props.onClose([]);
    }

    onAdd = () => {
        const { selected } = this.state;
        const { galleryFiles } = this.props;

        const selectedGalleryFiles = selected.map(id => (
            galleryFiles.find(file => file.id === +id) || { id }
        ));

        this.props.onClose(selectedGalleryFiles);
    }

    getTableData = memoize(({ galleryFiles, selected, searchInputValue }) => {
        const filterdGalleryFiles = galleryFiles.filter(
            file => caseInsensitiveSubmatch(file.title, searchInputValue),
        );

        return filterdGalleryFiles.map(file => (
            { ...file, selected: selected.includes(file.id) }
        ));
    })

    handleUploadButton = (files) => {
        const file = files[0];

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload({
                projects: this.props.projects,
            }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                this.setState({
                    selected: [...this.state.selected, response.id],
                });

                const { projects } = this.props;
                this.userGalleryFilesRequest.init({ projects }).start();
            })
            .failure((response) => {
                const message = transformAndCombineResponseErrors(response.errors);
                console.warn(message);
            })
            .fatal(() => {
                console.warn('Could not upload file');
            })
            .build();

        this.uploader.start();
    }

    handleFileSelection = (file) => {
        const { selected } = this.state;
        const index = selected.indexOf(file.id);
        if (index === -1) {
            // add to array
            this.setState({
                selected: selected.concat(file.id),
            });
        } else {
            // remove from array
            const newSelected = [...selected];
            newSelected.splice(index, 1);
            this.setState({
                selected: newSelected,
            });
        }
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({
            searchInputValue,
        });
    };

    keySelector = file => file.id

    renderGalleryFileType = (row) => {
        const icon = leadTypeIconMap[row.mimeType] || iconNames.documentText;
        const url = row.file;

        const iconChild = <i className={icon} />;

        if (!url) {
            return iconChild;
        }

        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {iconChild}
            </a>
        );
    }

    renderCheckbox = row => (
        <AccentButton
            title={
                row.selected
                    ? _ts('components.deepGallerySelect', 'unselect')
                    : _ts('components.deepGallerySelect', 'select')
            }
            onClick={() => this.handleFileSelection(row)}
            smallVerticalPadding
            transparent
            iconName={
                row.selected
                    ? iconNames.checkbox
                    : iconNames.checkboxOutlineBlank
            }
        />
    )

    render() {
        const {
            pending,
            selected,
            searchInputValue,
        } = this.state;

        const { galleryFiles } = this.props;

        const tableData = this.getTableData({
            galleryFiles,
            selected,
            searchInputValue,
        });

        return ([
            <ModalHeader
                key="header"
                className={styles.modalHeader}
                title={_ts('components.deepGallerySelect', 'modalTitle')}
                rightComponent={
                    <SearchInput
                        onChange={this.handleSearchInputChange}
                        placeholder={_ts('components.deepGallerySelect', 'searchGalleryPlaceholder')}
                        className={styles.searchInput}
                        label={_ts('components.deepGallerySelect', 'searchGalleryLabel')}
                        value={searchInputValue}
                        showLabel={false}
                        showHintAndError={false}
                        disabled={pending}
                    />
                }
            />,
            <ModalBody
                className={styles.modalBody}
                key="body"
            >
                { pending && <LoadingAnimation /> }
                <Table
                    data={tableData}
                    headers={this.galleryFilesHeader}
                    keySelector={this.keySelector}
                    defaultSort={this.defaultSort}
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <FileInput
                    className={styles.fileInput}
                    onChange={this.handleUploadButton}
                    value=""
                    showStatus={false}
                >
                    {_ts('components.deepGallerySelect', 'uploadFileButtonLabel')}
                </FileInput>
                <Button onClick={this.onClose}>
                    {_ts('components.deepGallerySelect', 'cancelButtonLabel')}
                </Button>
                <PrimaryButton
                    onClick={this.onAdd}
                    disabled={pending}
                >
                    {_ts('components.deepGallerySelect', 'addButtonLabel')}
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
