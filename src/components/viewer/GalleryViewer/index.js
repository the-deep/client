import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import AccentButton from '#rsca/Button/AccentButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import Message from '#rscv/Message';
import urlRegex from '#rsu/regexForWeburl';
import Icon from '#rscg/Icon';

import { galleryMapping, galleryType } from '#config/deepMimeTypes';
import notify from '#notify';
import _ts from '#ts';

import Screenshot from './Screenshot';
import GalleryImage from './GalleryImage';
import GalleryDocs from './GalleryDocs';

import styles from './styles.scss';

function isUrlValid(url) {
    return url && urlRegex.test(url);
}

function Preview(props) {
    const {
        className,

        url,
        mimeType,

        canShowIframe,

        cannotPreviewUrlMessage,
        invalidUrlMessage,
        unsupportedTypeMessage,

        error,
    } = props;

    if (error) {
        return (
            <Message className={styles.errorUrl}>
                {error}
            </Message>
        );
    }

    const isHttps = !!(url || '').match(/^https:\/\//) || window.location.protocol === 'http:';

    if (galleryMapping[mimeType] === galleryType.IMAGE) {
        // NOTE: Error can occur if
        // 1. If there is no alternative https url and current url is http
        const previewError = !isHttps;
        if (previewError) {
            return (
                <Message className={styles.errorUrl}>
                    {cannotPreviewUrlMessage || _ts('components.galleryViewer', 'cannotPreviewUrl')}
                </Message>
            );
        }
        return (
            <GalleryImage
                className={className}
                imageUrl={url}
            />
        );
    } else if (galleryMapping[mimeType] === galleryType.DOC) {
        // NOTE: no need to check for https for GalleryDocs as it has google viewer as fallback
        return (
            <GalleryDocs
                className={className}
                docUrl={url}
                mimeType={mimeType}
                canShowIframe={canShowIframe}
                notHttps={!isHttps}
            />
        );
    } else if (galleryMapping[mimeType] === galleryType.HTML || url.endsWith('txt')) {
        if (!url || !isUrlValid(url)) {
            return (
                <Message className={styles.errorUrl}>
                    {invalidUrlMessage || _ts('components.galleryViewer', 'invalidUrl')}
                </Message>
            );
        }
        // NOTE: Error can occur if
        // 1. We cannot show iframe
        // 2. If there is no alternative https url and current url is http
        const previewError = !canShowIframe || !isHttps;
        if (previewError) {
            return (
                <Message className={styles.errorUrl}>
                    {cannotPreviewUrlMessage || _ts('components.galleryViewer', 'cannotPreviewUrl')}
                </Message>
            );
        }

        return (
            <iframe
                className={className}
                sandbox="allow-scripts allow-same-origin"
                title={url}
                src={url}
            />
        );
    }

    return (
        <Message className={styles.errorUrl}>
            {unsupportedTypeMessage || _ts('components.galleryViewer', 'unsupportedType')}
        </Message>
    );
}

function Bar(props) {
    const {
        url = '',
        children,
    } = props;

    const className = _cs(
        styles.urlbar,
        'urlbar',
    );

    return (
        <div className={className}>
            <TextInput
                className={styles.url}
                value={url}
                readOnly
                showLabel={false}
                showHintAndError={false}
                selectOnFocus
            />
            <div className={styles.actionButtons}>
                <a
                    className={styles.openLink}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={_ts('components.galleryViewer', 'viewLinkTooltip')} // open link in new tab
                >
                    <Icon name="openLink" />
                </a>
                {children}
            </div>
        </div>
    );
}

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    mimeType: PropTypes.string,
    canShowIframe: PropTypes.bool,
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,

    invalidUrlMessage: PropTypes.string,
    cannotPreviewUrlMessage: PropTypes.string,
    unsupportedTypeMessage: PropTypes.string,
};

const defaultProps = {
    className: '',
    url: '',
    mimeType: '',
    canShowIframe: false,
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,

    invalidUrlMessage: undefined,
    cannotPreviewUrlMessage: undefined,
    unsupportedTypeMessage: undefined,
};

/*
 * Document [pdf, image, docx, html, txt] viewer handler
 * Use required document viewer according to the mime-type
*/
export default class GalleryViewer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            isFullscreen: false,
            screenshotMode: false,
            currentScreenshot: undefined,
        };

        this.viewerRef = React.createRef();
    }

    componentDidMount() {
        // NOTE: This is to add listener to whenever full screen mode is entered
        // and to change state of buttons after fullscreen mode is closed
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    }

    componentWillUnmount() {
        // NOTE: Remove attached listener after this component is dismounted
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    }

    handleFullscreenChange = () => {
        this.setState({ isFullscreen: isDefined(document.fullscreenElement) });
    }

    handleScreenshot = (image) => {
        this.setState({ currentScreenshot: image });
    }

    handleScreenshotStart = () => {
        this.setState({ screenshotMode: true });
    }

    handleScreenshotClose = () => {
        this.setState({ screenshotMode: false });
    }

    handleFullscreenClick = () => {
        const { isFullscreen } = this.state;
        const { current: viewerContainer } = this.viewerRef;
        if (isNotDefined(viewerContainer)) {
            return;
        }
        if (!isFullscreen && isDefined(viewerContainer.requestFullscreen)) {
            viewerContainer.requestFullscreen();
        } else if (isFullscreen && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }

    handleScreenshotDone = () => {
        this.setState(
            { screenshotMode: false },
            () => {
                const { onScreenshotCapture } = this.props;
                const { currentScreenshot } = this.state;

                if (onScreenshotCapture) {
                    onScreenshotCapture(currentScreenshot);
                }
                const { current: viewerContainer } = this.viewerRef;
                if (
                    isDefined(document.fullscreenElement)
                    && isDefined(viewerContainer)
                    && isDefined(document.exitFullscreen)
                ) {
                    document.exitFullscreen();
                }
            },
        );
    }

    handleScreenshotError = (message) => {
        notify.send({
            title: _ts('components.galleryViewer', 'errorTitle'), // screenshot
            type: notify.type.ERROR,
            message,
            duration: notify.duration.SLOW,
        });

        this.handleScreenshotClose();
    }

    renderScreenshotButton = () => {
        const {
            screenshotMode,
            currentScreenshot,
        } = this.state;

        if (!screenshotMode) {
            return (
                <AccentButton
                    iconName="camera"
                    onClick={this.handleScreenshotStart}
                    transparent
                    title={_ts('components.galleryViewer', 'screenshotButtonTitle')} // take screenshot
                />
            );
        }

        return (
            <Fragment>
                {currentScreenshot && (
                    <SuccessButton
                        iconName="check"
                        onClick={this.handleScreenshotDone}
                        title={_ts('components.galleryViewer', 'saveButtonTitle')} // save screenshot
                        transparent
                    />
                )}
                <DangerButton
                    iconName="close"
                    onClick={this.handleScreenshotClose}
                    title={_ts('components.galleryViewer', 'discardButtonTitle')} // discard screenshot
                    transparent
                />
            </Fragment>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            url,
            showUrl,
            showScreenshot,
            ...otherProps
        } = this.props;

        const {
            screenshotMode,
            isFullscreen,
        } = this.state;

        const showBar = showUrl || showScreenshot;

        const className = _cs(
            styles.galleryViewer,
            showBar && styles.urlbarShown,
            classNameFromProps,
        );

        const docContainerClassName = _cs(
            styles.docContainer,
            'doc-container',
        );

        return (
            <div
                className={className}
                ref={this.viewerRef}
            >
                {showBar && (
                    <Bar url={url}>
                        {showScreenshot && this.renderScreenshotButton()}
                        <AccentButton
                            transparent
                            iconName={isFullscreen ? 'shrink' : 'expand'}
                            onClick={this.handleFullscreenClick}
                        />
                    </Bar>
                )}
                <div className={docContainerClassName}>
                    {screenshotMode && (
                        <Screenshot
                            onCapture={this.handleScreenshot}
                            onCaptureError={this.handleScreenshotError}
                            onCancel={this.handleScreenshotClose}
                        />
                    )}
                    <Preview
                        className={styles.doc}
                        url={url}
                        {...otherProps}
                    />
                </div>
            </div>
        );
    }
}
