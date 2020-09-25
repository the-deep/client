import PropTypes from 'prop-types';
import React from 'react';

import Message from '#rscv/Message';
import { LEAD_TYPE } from '#entities/lead';
import InternalGalleryWithTabular from '#components/viewer/InternalGalleryWithTabular';
import ExternalGallery from '#components/viewer/ExternalGallery';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,

    handleScreenshot: PropTypes.func,
    showScreenshot: PropTypes.bool,

    onTabularButtonClick: PropTypes.func,
    tabularBookExtractionDisabled: PropTypes.bool,
};

const defaultProps = {
    className: '',

    showScreenshot: false,
    handleScreenshot: undefined,

    tabularBookExtractionDisabled: undefined,
    onTabularButtonClick: undefined,
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

            tabularBook,
            project: projectId,
        },

        onTabularButtonClick,
        tabularBookExtractionDisabled,

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
            <InternalGalleryWithTabular
                className={_cs(styles.preview, className)}
                galleryId={attachment.id}
                showUrl

                onScreenshotCapture={handleScreenshot}
                showScreenshot={showScreenshot}

                tabularBook={tabularBook}
                projectId={projectId}
                onTabularButtonClick={onTabularButtonClick}
                tabularBookExtractionDisabled={tabularBookExtractionDisabled}
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
