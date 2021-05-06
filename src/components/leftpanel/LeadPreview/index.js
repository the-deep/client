import PropTypes from 'prop-types';
import React from 'react';

import Message from '#rscv/Message';
import { LEAD_TYPE } from '#entities/lead';
import InternalGallery from '#components/viewer/InternalGallery';
import ExternalGallery from '#components/viewer/ExternalGallery';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const noop = () => {};

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    handleScreenshot: PropTypes.func,
    showScreenshot: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    showScreenshot: false,
    handleScreenshot: noop,
    className: '',
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
            lead: {
                sourceType: type,
                url,
                attachment,
            },
            className,
            showScreenshot,
        } = this.props;

        if (LeadPreview.isTypeWithUrl(type) && url) {
            return (
                <ExternalGallery
                    className={_cs(styles.preview, className)}
                    url={url}
                    onScreenshotCapture={this.props.handleScreenshot}
                    showScreenshot={showScreenshot}
                    showUrl
                />
            );
        } else if (LeadPreview.isTypeWithAttachment(type) && attachment) {
            return (
                <InternalGallery
                    className={_cs(styles.preview, className)}
                    attachment={attachment}
                    onScreenshotCapture={this.props.handleScreenshot}
                    showScreenshot={showScreenshot}
                    showUrl
                />
            );
        }

        return (
            <div className={className}>
                <Message>
                    {_ts('components.leadPreview', 'previewNotAvailableText')}
                </Message>
            </div>
        );
    }
}
