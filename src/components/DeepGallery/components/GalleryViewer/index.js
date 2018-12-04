import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';
import Message from '#rscv/Message';
import urlRegex from '#rsu/regexForWeburl';

import { galleryMapping, galleryType } from '#config/deepMimeTypes';
import { iconNames } from '#constants';
import notify from '#notify';
import _ts from '#ts';

import Screenshot from '../../../Screenshot';
import GalleryImage from '../GalleryImage';
import GalleryDocs from '../GalleryDocs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    mimeType: PropTypes.string,
    canShowIframe: PropTypes.bool,
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,

    showTabular: PropTypes.bool,
    onTabularClick: PropTypes.func,

    invalidUrlMessage: PropTypes.string,
    cannotPreviewUrlMessage: PropTypes.string,
};

const defaultProps = {
    className: '',
    url: '',
    mimeType: '',
    canShowIframe: false,
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,
    showTabular: false,
    onTabularClick: undefined,

    invalidUrlMessage: undefined,
    cannotPreviewUrlMessage: undefined,
};

/*
 * Document [pdf, image, docx, html] viewer handler
 * Use required document viewer according to the mime-type
*/
export default class GalleryViewer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isUrlValid = url => (url && urlRegex.test(url))

    constructor(props) {
        super(props);

        this.state = {
            screenshotMode: false,
        };
    }

    handleTabularClick = () => {
        this.props.onTabularClick(this.props.mimeType);
    }

    handleScreenshot = (image) => {
        this.setState({ currentScreenshot: image });
    }

    handleScreenshotDone = () => {
        this.setState({ screenshotMode: false });
        if (this.props.onScreenshotCapture) {
            this.props.onScreenshotCapture(this.state.currentScreenshot);
        }
    }

    handleScreenshotClose = () => {
        this.setState({ screenshotMode: false });
    }

    handleScreenshotError = (message) => {
        notify.send({
            title: _ts('components.galleryViewer', 'errorTitle'), // screenshot
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
        this.setState({ screenshotMode: false });
    }

    renderHTML = ({ className, url }) => (
        <iframe
            className={className}
            sandbox="allow-scripts allow-same-origin"
            title={url}
            src={url}
        />
    )

    renderErrorScreen = (url) => {
        const {
            invalidUrlMessage,
            cannotPreviewUrlMessage,
        } = this.props;
        return (
            <Message className={styles.errorUrl}>
                {
                    GalleryViewer.isUrlValid(url) ? (
                        cannotPreviewUrlMessage || _ts('components.galleryViewer', 'cannotPreviewUrl')
                    ) : (
                        invalidUrlMessage || _ts('components.galleryViewer', 'invalidUrl')
                    )
                }
            </Message>
        );
    }

    renderScreenshotButton = () => {
        const { screenshotMode, currentScreenshot } = this.state;
        if (screenshotMode) {
            return (
                <Fragment>
                    {
                        currentScreenshot && (
                            <AccentButton
                                iconName={iconNames.check}
                                onClick={this.handleScreenshotDone}
                                title={_ts('components.galleryViewer', 'saveButtonTitle')} // save screenshot
                                transparent
                            />
                        )
                    }
                    <AccentButton
                        iconName={iconNames.close}
                        onClick={this.handleScreenshotClose}
                        title={_ts('components.galleryViewer', 'discardButtonTitle')} // discard screenshot
                        transparent
                    />
                </Fragment>
            );
        }

        return (
            <AccentButton
                iconName={iconNames.camera}
                onClick={() => { this.setState({ screenshotMode: true }); }}
                transparent
                title={_ts('components.galleryViewer', 'screenshotButtonTitle')} // take screenshot
            />
        );
    }

    renderBar = ({ url, showScreenshot, showTabular }) => {
        const isScreenshotable = showScreenshot;
        const urlbarClassNames = [
            styles.urlbar,
            'urlbar',
        ];
        return (
            <div className={urlbarClassNames.join(' ')}>
                <TextInput
                    className={styles.url}
                    value={url || ''}
                    readOnly
                    showLabel={false}
                    showHintAndError={false}
                    selectOnFocus
                />
                {
                    <div className={styles.actionButtons}>
                        <a
                            className={styles.openLink}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={_ts('components.galleryViewer', 'viewLinkTooltip')} // open link in new tab
                        >
                            <span className={iconNames.openLink} />
                        </a>
                        { isScreenshotable && this.renderScreenshotButton() }
                        { showTabular &&
                            <AccentButton
                                iconName={iconNames.tabular}
                                onClick={this.handleTabularClick}
                                title={_ts('components.galleryViewer', 'convertTabular')}
                                transparent
                            />
                        }
                    </div>
                }
            </div>
        );
    }

    renderPreview = ({ className, url, mimeType, canShowIframe, previewError, isHttps }) => {
        if (isHttps && galleryMapping[mimeType] === galleryType.IMAGE) {
            return (
                <GalleryImage
                    className={className}
                    imageUrl={url}
                    canShowIframe={canShowIframe}
                />
            );
        } else if (galleryMapping[mimeType] === galleryType.DOC) {
            return (
                <GalleryDocs
                    className={className}
                    docUrl={url}
                    mimeType={mimeType}
                    canShowIframe={canShowIframe}
                    notHttps={!isHttps}
                />
            );
        } else if (!previewError && (
            galleryMapping[mimeType] === galleryType.HTML || url.endsWith('txt')
        )) {
            // NOTE: Error can occur if
            // 1. We cannot show iframe
            // 2. If there is no alternative https url and current url is http
            return this.renderHTML({ className, url });
        }
        return this.renderErrorScreen(url);
    }

    render() {
        const {
            className,
            url,
            mimeType,
            canShowIframe,
            showUrl,
            showScreenshot,
            showTabular,
        } = this.props;
        const { screenshotMode } = this.state;

        const containerStyles = [styles.galleryViewer];
        const isHttps = !!(url || '').match(/^https:\/\//) || window.location.protocol === 'http:';
        const previewError = !canShowIframe || !isHttps;
        const showBar = showUrl || showScreenshot;

        if (showBar) {
            containerStyles.push(styles.urlbarShown);
        }

        const docContainerClassNames = [
            styles.docContainer,
            'doc-container',
        ];

        return (
            <div className={`${containerStyles.join(' ')} ${className}`}>
                {
                    showBar &&
                    this.renderBar({
                        url,
                        showUrl,
                        showBar,
                        showScreenshot,
                        showTabular,
                    })
                }
                <div className={docContainerClassNames.join(' ')}>
                    { screenshotMode && (
                        <Screenshot
                            onCapture={this.handleScreenshot}
                            onCaptureError={this.handleScreenshotError}
                            onCancel={this.handleScreenshotClose}
                        />
                    )}
                    {
                        this.renderPreview({
                            className: styles.doc,
                            url,
                            mimeType,
                            canShowIframe,
                            previewError,
                            isHttps,
                        })
                    }
                </div>
            </div>
        );
    }
}
