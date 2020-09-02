import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
    isTruthyString,
    isDefined,
} from '@togglecorp/fujs';

import Message from '#rscv/Message';
import Modal from '#rscv/Modal';

import ExternalGallery from '#components/viewer/ExternalGallery';
import TabularBook from '#components/other/TabularBook';
import Attachment from '#components/viewer/Attachment';

import _ts from '#ts';

import {
    leadAddSetLeadTabularBookAction,
    leadAddPageActiveLeadSelector,
} from '#redux';

import {
    leadKeySelector,
    leadSourceTypeSelector,
    leadFaramValuesSelector,
    LEAD_TYPE,
} from '../utils';

import LeadTabular from './LeadTabular';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
    onTabularBookSet: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

function LeadPreview(props) {
    const {
        className,
        lead,
        onTabularBookSet,
    } = props;

    const [tabularModalShown, setTabularModalShown] = useState(false);
    const [tabularChangeKey, setTabularChangeKey] = useState(1);
    const [tabularFileType, setTabularFileType] = useState();

    const handleTabularButtonClick = useCallback(
        (response) => {
            const { fileType } = response;
            setTabularModalShown(true);
            setTabularFileType(fileType);
        },
        [],
    );

    const handleTabularModalClose = useCallback(
        () => {
            setTabularModalShown(false);
            setTabularFileType(undefined);
            setTabularChangeKey(i => i + 1);
        },
        [],
    );

    const handleTabularBookDelete = useCallback(
        () => {
            const leadKey = leadKeySelector(lead);
            onTabularBookSet({ leadKey, tabularBook: undefined });
            handleTabularModalClose();
        },
        [lead, onTabularBookSet, handleTabularModalClose],
    );

    const handleTabularBookSet = useCallback(
        (tabularBook) => {
            const leadKey = leadKeySelector(lead);
            onTabularBookSet({ leadKey, tabularBook });
        },
        [lead, onTabularBookSet],
    );

    const type = leadSourceTypeSelector(lead);
    const values = leadFaramValuesSelector(lead);
    const {
        project: projectId,
        url,
        attachment,
        title,
        tabularBook,
    } = values;

    switch (type) {
        case LEAD_TYPE.text:
            return null;
        case LEAD_TYPE.website:
            return (
                <div className={className} >
                    {isTruthyString(url) ? (
                        <ExternalGallery
                            className={styles.galleryFile}
                            url={url}
                            showUrl
                        />
                    ) : (
                        <Message className={className}>
                            {_ts('addLeads', 'sourcePreview')}
                        </Message>
                    )}
                </div>
            );
        default:
            return (
                <div className={className} >
                    {isDefined(attachment) ? (
                        <Attachment
                            key={tabularChangeKey}
                            attachment={attachment}
                            title={title}
                            tabularBook={tabularBook}
                            className={styles.galleryFile}
                            projectId={projectId}
                            onTabularButtonClick={handleTabularButtonClick}
                        />
                    ) : (
                        <Message>
                            {_ts('addLeads', 'previewNotAvailable')}
                        </Message>
                    )}
                    {tabularModalShown && (
                        <Modal
                            className={styles.tabularModal}
                            onClose={handleTabularModalClose}
                        >
                            {tabularBook || tabularFileType !== 'csv' ? (
                                <TabularBook
                                    leadTitle={title}
                                    className={styles.tabularBook}
                                    bookId={tabularBook}
                                    projectId={projectId}
                                    onDelete={handleTabularBookDelete}
                                    onCancel={handleTabularModalClose}
                                    fileId={attachment.id}
                                    fileType={tabularFileType}
                                    onTabularBookCreate={handleTabularBookSet}
                                />
                            ) : (
                                <LeadTabular
                                    className={styles.leadTabular}
                                    fileType={tabularFileType}
                                    setTabularBook={handleTabularBookSet}
                                    onCancel={handleTabularModalClose}
                                    lead={lead}
                                />
                            )}
                        </Modal>
                    )}
                </div>
            );
    }
}

LeadPreview.propTypes = propTypes;
LeadPreview.defaultProps = defaultProps;

const mapStateToProps = state => ({
    lead: leadAddPageActiveLeadSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onTabularBookSet: params => dispatch(leadAddSetLeadTabularBookAction(params)),
});
export default connect(mapStateToProps, mapDispatchToProps)(
    LeadPreview,
);
