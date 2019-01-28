import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';

import Button from '#rsca/Button';
import { FaramInputElement } from '#rscg/FaramElements';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DropZone from '#rsci/DropZone';
import FileInput from '#rsci/FileInput';
import HintAndError from '#rsci/HintAndError';
import TextInput from '#rsci/TextInput';
import ListView from '#rscv/List/ListView';
import { randomString } from '#rsu/common';
import { CoordinatorBuilder } from '#rsu/coordinate';
import urlRegex from '#rsu/regexForWeburl';
import { UploadBuilder } from '#rsu/upload';
import Label from '#rsci/Label';
import { iconNames } from '#constants';
import {
    urlForUpload,
    createParamsForFileUpload,
} from '#rest';
import _cs from '#cs';
import _ts from '#ts';

import SelectionItem from './SelectionItem';
import styles from './styles.scss';

const propTypes = {
    onPending: PropTypes.func,

    className: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.array,

    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    showPageRange: PropTypes.bool,
    showUrlInput: PropTypes.bool,
    showFileInput: PropTypes.bool,

    acceptFileTypes: PropTypes.string,

    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
};

const defaultProps = {
    onPending: undefined,

    className: '',
    label: '',
    onChange: undefined,
    value: [],

    showLabel: true,
    showHintAndError: true,
    showPageRange: false,
    showUrlInput: false,
    showFileInput: true,

    acceptFileTypes: undefined,

    disabled: false,
    readOnly: false,
    error: undefined,
    hint: undefined,
};

const isUrlValid = url => (url && urlRegex.test(url));

@FaramInputElement
export default class MultiDocumentUploader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = item => item.key;

    constructor(props) {
        super(props);

        this.dragEnterCount = 0;

        this.state = {
            pending: false,
            urlValue: undefined,
            isBeingDraggedOver: false,
        };

        this.uploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState(
                    { pending: true },
                    () => this.props.onPending(true),
                );
            })
            .postSession(() => {
                // FIXME: handle errors properly
                // console.warn('Total errors:', totalErrors);
                this.setState(
                    { pending: false },
                    () => this.props.onPending(false),
                );
            })
            .build();
    }

    componentWillUnmount() {
        this.uploadCoordinator.stop();
    }

    handleDragEnter = () => {
        if (this.dragEnterCount === 0) {
            this.setState({ isBeingDraggedOver: true });
        }

        this.dragEnterCount += 1;
    }

    handleDragLeave = () => {
        this.dragEnterCount -= 1;

        if (this.dragEnterCount === 0) {
            this.setState({ isBeingDraggedOver: false });
        }
    }

    handleUrlChange = (value) => {
        this.setState({ urlValue: value });
    }

    handleUrlAdd = () => {
        const { urlValue } = this.state;
        this.props.onChange([
            ...this.props.value,
            {
                key: randomString(),
                type: 'url',
                name: urlValue,
                url: urlValue,
            },
        ]);
        this.setState({ urlValue: '' });
    }

    handleFileAdd = (files) => {
        this.dragEnterCount = 0;
        this.setState({ isBeingDraggedOver: false });

        files.forEach((file) => {
            const key = randomString();
            const uploader = new UploadBuilder()
                .file(file)
                .url(urlForUpload)
                .params(createParamsForFileUpload)
                .success((response) => {
                    const {
                        metadata: {
                            pages,
                        } = {},
                        id,
                        file: fileUrl,
                    } = response;
                    const { name } = file;
                    this.props.onChange([
                        ...this.props.value,
                        {
                            key,
                            type: 'file',
                            id,
                            name,
                            url: fileUrl,
                            startPage: 1,
                            endPage: pages,
                        },
                    ]);
                    this.uploadCoordinator.notifyComplete(key);
                })
                .fatal(() => {
                    this.uploadCoordinator.notifyComplete(key, true);
                })
                .failure(() => {
                    this.uploadCoordinator.notifyComplete(key, true);
                })
                .build();
            this.uploadCoordinator.add(key, uploader);
        });
        this.uploadCoordinator.start();
    }

    handleRemoveClick = (key) => {
        const { value } = this.props;
        const newValue = produce(value, (safeValue) => {
            const index = safeValue.findIndex(
                val => MultiDocumentUploader.keySelector(val) === key,
            );
            safeValue.splice(index, 1);
        });
        this.props.onChange(newValue);
    }

    handleStartPageChange = (key, startPageValue) => {
        const { value } = this.props;
        const newValue = produce(value, (safeValue) => {
            const index = safeValue.findIndex(
                val => MultiDocumentUploader.keySelector(val) === key,
            );
            // eslint-disable-next-line no-param-reassign
            safeValue[index].startPage = startPageValue;
        });
        this.props.onChange(newValue);
    }

    handleEndPageChange = (key, endPageValue) => {
        const { value } = this.props;
        const newValue = produce(value, (safeValue) => {
            const index = safeValue.findIndex(
                val => MultiDocumentUploader.keySelector(val) === key,
            );
            // eslint-disable-next-line no-param-reassign
            safeValue[index].endPage = endPageValue;
        });
        this.props.onChange(newValue);
    }

    rendererParamsForSelection = (key, item) => ({
        disabled: this.props.disabled,
        readOnly: this.props.readOnly,
        showPageRange: this.props.showPageRange,

        selectionKey: key,

        url: item.url,
        name: item.name,
        startPage: item.startPage,
        endPage: item.endPage,

        onRemoveClick: this.handleRemoveClick,
        onStartPageChange: this.handleStartPageChange,
        onEndPageChange: this.handleEndPageChange,

        className: styles.selectionItem,
    });

    render() {
        const {
            className: classNameFromProps,
            showLabel,
            label,

            showUrlInput,
            showFileInput,
            showHintAndError,
            hint,
            error,
            value,

            disabled,
            readOnly,
            acceptFileTypes,
        } = this.props;

        const {
            urlValue,
            pending,
            isBeingDraggedOver,
        } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.multiDocumentUploader,
            'multi-document-uploader',
        );

        const isValueEmpty = value.length === 0;
        const showDropZone = showFileInput
            && (isValueEmpty || isBeingDraggedOver)
            && !pending;

        // TODO: transfer error accordingly

        return (
            <div
                className={className}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
            >
                <Label
                    className={_cs(styles.label, 'label')}
                    show={showLabel}
                    text={label}
                />
                <div
                    className={_cs(
                        styles.top,
                        showUrlInput ? styles.withUrlInput : '',
                    )}
                >
                    { showUrlInput && (
                        <div className={styles.urlContainer}>
                            <TextInput
                                className={styles.urlInput}
                                placeholder={_ts('components.multiDocumentUploader', 'externalLinkLabel')}
                                value={urlValue}
                                onChange={this.handleUrlChange}
                                showLabel={false}
                                showHintAndError={false}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <Button
                                className={styles.addButton}
                                onClick={this.handleUrlAdd}
                                iconName={iconNames.add}
                                disabled={disabled || readOnly || !(
                                    urlValue && isUrlValid(urlValue)
                                )}
                            />
                        </div>
                    )}
                    { showFileInput && (
                        <FileInput
                            className={styles.fileInput}
                            onChange={this.handleFileAdd}
                            showStatus={false}
                            disabled={disabled || readOnly}
                            accept={acceptFileTypes}
                            multiple
                            value=""
                        >
                            <span
                                title={_ts('components.multiDocumentUploader', 'uploadFilesLabel')}
                                className={iconNames.upload}
                            />
                        </FileInput>
                    )}
                </div>
                { pending && (
                    <div className={styles.pendingMessage}>
                        <div className={styles.loadingAnimationWrapper}>
                            <LoadingAnimation className={styles.loadingAnimation} />
                        </div>
                        <div className={styles.pendingMessage}>
                            {_ts('components.multiDocumentUploader', 'uploadingFilesLabel')}
                        </div>
                    </div>
                )}
                <div className={styles.content}>
                    { showDropZone && (
                        <DropZone
                            className={styles.dropZone}
                            onDrop={this.handleFileAdd}
                            disabled={disabled || readOnly}
                        >
                            {_ts('components.multiDocumentUploader', 'dropFilesHereLabel')}
                        </DropZone>
                    )}
                    <ListView
                        className={styles.selectionItems}
                        data={value}
                        keySelector={MultiDocumentUploader.keySelector}
                        rendererParams={this.rendererParamsForSelection}
                        renderer={SelectionItem}
                    />
                </div>
                <HintAndError
                    className={styles.hintAndError}
                    show={showHintAndError}
                    error={error}
                    hint={hint}
                />
            </div>
        );
    }
}
