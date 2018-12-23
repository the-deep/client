import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DropZone from '#rsci/DropZone';
import { FaramInputElement } from '#rscg/FaramElements';
import FileInput from '#rsci/FileInput';
import NumberInput from '#rsci/NumberInput';
import TextInput from '#rsci/TextInput';
import iconNames from '#rsk/iconNames';
import { isTruthy, isFalsy } from '#rsu/common';
import { UploadBuilder } from '#rsu/upload';
import urlRegex from '#rsu/regexForWeburl';

import {
    urlForUpload,
    createParamsForFileUpload,
    transformAndCombineResponseErrors,
} from '#rest';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.shape({
        type: PropTypes.string,
    }),
    showLabel: PropTypes.bool,
    showPageRange: PropTypes.bool,
    acceptUrl: PropTypes.bool,
    acceptFileTypes: PropTypes.string,
    urlLabel: PropTypes.string,

    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    showHintAndError: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    onChange: undefined,
    showLabel: true,
    value: {},
    showPageRange: false,
    acceptUrl: false,
    acceptFileTypes: undefined,
    urlLabel: 'External link',

    disabled: false,
    readOnly: false,
    error: '',
    hint: '',
    showHintAndError: true,
};

const isUrlValid = url => (url && urlRegex.test(url));

@FaramInputElement
export default class Baksa extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static bothPageRequiredCondition = (value) => {
        const ok = isFalsy(value) ||
            (isTruthy(value.startPage) && isTruthy(value.endPage)) ||
            (isFalsy(value.startPage) && isFalsy(value.endPage));
        return {
            ok,
            message: 'Both start page and end page must be specified',
        };
    }

    static validPageRangeCondition = (value) => {
        const ok = isFalsy(value)
            || isFalsy(value.startPage) || isFalsy(value.endPage)
            || value.startPage <= value.endPage;
        return {
            ok,
            message: 'Start page must be less than end page',
        };
    }

    static validPageNumbersCondition = (value) => {
        const ok = isFalsy(value) || (
            (isFalsy(value.startPage) || value.startPage > 0) &&
            (isFalsy(value.endPage) || value.endPage > 0)
        );
        return {
            ok,
            message: 'Page numbers must be greater than 0',
        };
    }

    static pendingCondition = (value) => {
        const ok = isFalsy(value) || isFalsy(value.pending);
        return {
            ok,
            message: 'File is being uploaded',
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            url: undefined,
            pending: undefined,
            selectedFile: undefined,
            error: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ error: undefined });
        }
    }

    componentWillUnmount() {
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    resetValue = () => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(undefined);
        }
    }

    handleUrlChange = (url) => {
        this.setState({ url });
    }

    handleUrlAdd = () => {
        const { onChange, value: { startPage, endPage } } = this.props;
        const { url } = this.state;

        // TODO: Check if url is valid
        if (onChange) {
            onChange({
                type: 'url',
                name: url,
                url,
                startPage,
                endPage,
            });
        }
    }

    handleFileChange = (files) => {
        const { onChange, value: { startPage, endPage } } = this.props;
        const file = files[0];

        if (!onChange) {
            return;
        }

        // This is a hack
        onChange({
            pending: true,
        });

        this.setState({
            pending: true,
            selectedFile: file,
        });

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                const { metadata: { pages } = {} } = response;
                let value = {
                    type: 'file',
                    id: response.id,
                    name: file.name,
                    url: response.file,
                    startPage,
                    endPage,
                };
                if (pages) {
                    value = {
                        ...value,
                        startPage: 1,
                        endPage: pages,
                    };
                }
                onChange(value);
            })
            .failure((response) => {
                const message = transformAndCombineResponseErrors(response.errors);
                this.setState({ error: message });
            })
            .fatal(() => {
                this.setState({ error: 'Couldn\t upload file' });
            })
            .build();

        this.uploader.start();
    }

    handleStartPageChange = (startPage) => {
        const { onChange, value } = this.props;
        if (onChange) {
            onChange({
                ...value,
                startPage,
            });
        }
    }

    handleEndPageChange = (endPage) => {
        const { value, onChange } = this.props;
        if (onChange) {
            onChange({
                ...value,
                endPage,
            });
        }
    }

    renderLabel = () => {
        const {
            showLabel,
            label,
        } = this.props;

        if (!showLabel) {
            return null;
        }

        const className = _cs(
            'label',
            styles.label,
        );

        return (
            <div className={className}>
                { label }
            </div>
        );
    }

    renderDropFileInput = () => {
        const {
            acceptUrl,
            urlLabel,
            disabled,
            readOnly,
            acceptFileTypes,
        } = this.props;
        const { url } = this.state;
        const elements = [];

        elements.push(
            <DropZone
                className={styles.dropZone}
                onDrop={this.handleFileChange}
                key="drop-zone"
                disabled={disabled || readOnly}
            >
                {/* Empty value in FileInput below cancels the selection automatically */}
                <FileInput
                    className={styles.fileInput}
                    onChange={this.handleFileChange}
                    showStatus={false}
                    value=""
                    disabled={disabled || readOnly}
                    accept={acceptFileTypes}
                    // FIXME: Use strings
                >
                    Drop a file or click to select
                </FileInput>
            </DropZone>,
        );

        if (acceptUrl) {
            elements.push(
                <div
                    className={styles.urlBox}
                    key="url-box"
                >
                    <TextInput
                        className={styles.urlInput}
                        label={urlLabel}
                        value={url}
                        onChange={this.handleUrlChange}
                        showHintAndError={false}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <PrimaryButton
                        className={styles.action}
                        onClick={this.handleUrlAdd}
                        disabled={disabled || readOnly || !(url && isUrlValid(url))}
                        // FIXME: Use strings
                    >
                        Add
                    </PrimaryButton>
                </div>,
            );
        }

        return elements;
    }

    renderUpload = () => {
        const { selectedFile: file } = this.state;

        return (
            <div className={styles.upload}>
                <div>
                    { file.name }
                </div>
                <span className={`${styles.action} ${iconNames.loading} ${styles.loadingIcon}`} />
            </div>
        );
    }

    renderSelection = () => {
        const {
            value,
            disabled,
            readOnly,
        } = this.props;

        return (
            <div className={styles.selection}>
                <a href={value.url} target="_blank" rel="noopener noreferrer">
                    { value.name }
                </a>
                <DangerButton
                    className={styles.action}
                    iconName={iconNames.close}
                    onClick={this.resetValue}
                    disabled={disabled || readOnly}
                    // FIXME: Use strings
                    title="Remove"
                    transparent
                />
            </div>
        );
    }

    renderPageRange = () => {
        const {
            value: { startPage, endPage },
            readOnly,
            disabled,
        } = this.props;

        return (
            <div className={styles.pageRange}>
                <NumberInput
                    className={styles.page}
                    value={startPage}
                    onChange={this.handleStartPageChange}
                    disabled={disabled}
                    readOnly={readOnly}
                    // FIXME: Use strings
                    hint="Start Page"
                    separator=" "
                />
                <span className={styles.separator}>
                    to
                </span>
                <NumberInput
                    className={styles.page}
                    value={endPage}
                    onChange={this.handleEndPageChange}
                    disabled={disabled}
                    readOnly={readOnly}
                    // FIXME: Use strings
                    hint="End Page"
                    separator=" "
                />
            </div>
        );
    }

    // FIXME: should have used HintAndError
    renderHintAndError = () => {
        const {
            showHintAndError,
            hint,
            error: propsError,
        } = this.props;

        const { error: stateError } = this.state;
        const error = stateError || propsError;

        if (!showHintAndError) {
            return null;
        }


        if (error) {
            const className = _cs(
                'error',
                styles.error,
            );

            return (
                <p className={className}>
                    {error}
                </p>
            );
        }

        if (hint) {
            const className = _cs(
                'hint',
                styles.hint,
            );
            return (
                <p className={className}>
                    {hint}
                </p>
            );
        }

        const className = _cs(
            'empty',
            styles.empty,
        );
        return (
            <p className={className}>
                -
            </p>
        );
    }


    render() {
        const {
            value,
            showPageRange,
            error,
            disabled,
            className: classNameFromProps,
        } = this.props;
        const { pending } = this.state;

        const Label = this.renderLabel;
        const DropFileInput = this.renderDropFileInput;
        const Upload = this.renderUpload;
        const Selection = this.renderSelection;
        const PageRange = this.renderPageRange;
        const HintAndError = this.renderHintAndError;

        const className = _cs(
            classNameFromProps,
            'baksa',
            styles.baksa,
            error && 'error',
            error && styles.error,
            disabled && 'disabled',
            disabled && styles.disabled,
        );

        return (
            <div className={className}>
                <Label />
                {pending && <Upload />}
                {!pending && !value.type && <DropFileInput />}
                {!pending && value.type && <Selection />}
                {!pending && value.type && showPageRange && <PageRange />}
                <HintAndError />
            </div>
        );
    }
}
