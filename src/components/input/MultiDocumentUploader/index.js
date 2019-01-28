import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import { FaramInputElement } from '#rscg/FaramElements';
import DropZone from '#rsci/DropZone';
import FileInput from '#rsci/FileInput';
import HintAndError from '#rsci/HintAndError';
import TextInput from '#rsci/TextInput';
import ListView from '#rscv/List/ListView';
import { randomString } from '#rsu/common';
import { CoordinatorBuilder } from '#rsu/coordinate';
import urlRegex from '#rsu/regexForWeburl';
import { UploadBuilder } from '#rsu/upload';
import {
    urlForUpload,
    createParamsForFileUpload,
} from '#rest';
import _cs from '#cs';

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
    showPageRange: true,
    showUrlInput: true,
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

        this.state = {
            pending: false,
            urlValue: undefined,
        };

        this.uploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState(
                    { pending: true },
                    () => this.props.onPending(true),
                );
            })
            .postSession((totalErrors) => {
                console.warn('Total errors:', totalErrors);
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
        return newValue;
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
        return newValue;
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
        return newValue;
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
    });

    render() {
        const {
            className,
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
        } = this.state;

        // TODO: transfer error accordingly

        return (
            <div className={className}>
                { showLabel &&
                    <div className={_cs(styles.label, 'labe')}>
                        {label}
                    </div>
                }
                { showUrlInput &&
                    <div className={styles.urlBox}>
                        <TextInput
                            className={styles.urlInput}
                            hint="External Link"
                            value={urlValue}
                            onChange={this.handleUrlChange}
                            showHintAndError={false}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                        <PrimaryButton
                            className={styles.action}
                            onClick={this.handleUrlAdd}
                            disabled={
                                disabled || readOnly || !(
                                    urlValue && isUrlValid(urlValue)
                                )
                            }
                        >
                            Add
                        </PrimaryButton>
                    </div>
                }
                { showFileInput &&
                    <DropZone
                        className={styles.dropZone}
                        onDrop={this.handleFileAdd}
                        disabled={disabled || readOnly}
                    >
                        <FileInput
                            className={styles.fileInput}
                            onChange={this.handleFileAdd}
                            showStatus={false}
                            disabled={disabled || readOnly}
                            accept={acceptFileTypes}
                            value=""
                        >
                            {/* NOTE: Empty value prop cancels the selection automatically */}
                            Drop a file or click to select
                        </FileInput>
                    </DropZone>
                }
                { pending && 'Uploading file ...' }
                <ListView
                    data={value}
                    keySelector={MultiDocumentUploader.keySelectorForSelection}
                    rendererParams={this.rendererParamsForSelection}
                    renderer={SelectionItem}
                />
                <HintAndError
                    show={showHintAndError}
                    error={error}
                    hint={hint}
                />
            </div>
        );
    }
}
