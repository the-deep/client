import PropTypes from 'prop-types';
import React from 'react';

import Message from '#rscv/Message';
import { LEAD_TYPE } from '#entities/lead';
import InternalGallery from '#components/viewer/InternalGallery';
import ExternalGallery from '#components/viewer/ExternalGallery';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,

    handleScreenshot: PropTypes.func,
    showScreenshot: PropTypes.bool,
};

const defaultProps = {
    className: '',

    showScreenshot: false,
    handleScreenshot: undefined,
};

const isTypeWithUrl = t => (t === LEAD_TYPE.website);
const isTypeWithAttachment = t => (
    [LEAD_TYPE.file, LEAD_TYPE.dropbox, LEAD_TYPE.drive].indexOf(t) !== -1
);

function LeadPreview(props) {
    const {
        lead: {
            sourceType: type,
            url,
            attachment,
        },
        className,
        showScreenshot,
        handleScreenshot,
    } = props;

    if (isTypeWithUrl(type) && url) {
        return (
            <ExternalGallery
                className={_cs(styles.preview, className)}
                url={url}
                showUrl
                onScreenshotCapture={handleScreenshot}
                showScreenshot={showScreenshot}
            />
        );
    } else if (isTypeWithAttachment(type) && attachment) {
        return (
            <InternalGallery
                className={_cs(styles.preview, className)}
                galleryId={attachment.id}
                onScreenshotCapture={handleScreenshot}
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
LeadPreview.propTypes = propTypes;
LeadPreview.defaultProps = defaultProps;

export default LeadPreview;
