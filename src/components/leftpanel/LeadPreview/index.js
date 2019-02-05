import PropTypes from 'prop-types';
import React from 'react';

import Message from '#rscv/Message';
import { LEAD_TYPE } from '#entities/lead';
import InternalGallery from '#components/viewer/InternalGallery';
import ExternalGallery from '#components/viewer/ExternalGallery';
import _ts from '#ts';

import styles from './styles.scss';

const noop = () => {};

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    handleScreenshot: PropTypes.func,
    showScreenshot: PropTypes.bool,
};

const defaultProps = {
    showScreenshot: false,
    handleScreenshot: noop,
};

export default class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isTypeWithUrl = t => t === LEAD_TYPE.website;

    static isTypeWithAttachment = t => (
        [LEAD_TYPE.file, LEAD_TYPE.dropbox, LEAD_TYPE.drive].indexOf(t) !== -1
    );

    render() {
        const {
            lead,
            showScreenshot,
        } = this.props;
        const { sourceType: type, url, attachment } = lead;

        if (LeadPreview.isTypeWithUrl(type) && url) {
            return (
                <ExternalGallery
                    className={styles.preview}
                    url={url}
                    onScreenshotCapture={this.props.handleScreenshot}
                    showScreenshot={showScreenshot}
                    showUrl
                />
            );
        } else if (LeadPreview.isTypeWithAttachment(type) && attachment) {
            return (
                <InternalGallery
                    className={styles.preview}
                    galleryId={attachment.id}
                    onScreenshotCapture={this.props.handleScreenshot}
                    showScreenshot={showScreenshot}
                    showUrl
                />
            );
        }

        return (
            <Message>
                {_ts('components.leadPreview', 'previewNotAvailableText')}
            </Message>
        );
    }
}
