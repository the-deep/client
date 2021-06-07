import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import AccentButton from '#rsca/Button/AccentButton';
import { mimeTypeToIconMap } from '#entities/lead';
import modalize from '#rscg/Modalize';

import LeadPreview from '../../LeadPreview';

const AccentModalButton = modalize(AccentButton);

const FileTypeViewer = ({ lead }) => {
    const {
        attachment,
        url: leadUrl,
        tabularBook,
    } = lead;

    const icon = (tabularBook && 'tabularIcon')
        || (attachment && mimeTypeToIconMap[attachment.mimeType])
        || (leadUrl && 'globe')
        || 'documentText';

    const url = (attachment && attachment.file) || leadUrl;

    return (
        <div className="icon-wrapper">
            { url ? (
                <AccentModalButton
                    iconName={icon}
                    transparent
                    modal={
                        <LeadPreview value={lead} />
                    }
                />
            ) : (
                <Icon name={icon} />
            )}
        </div>
    );
};

FileTypeViewer.propTypes = {
    lead: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        attachment: PropTypes.object,
        url: PropTypes.string,
        tabularBook: PropTypes.number,
    }).isRequired,
};

export default FileTypeViewer;

