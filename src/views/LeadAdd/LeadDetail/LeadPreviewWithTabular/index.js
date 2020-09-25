import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Modal from '#rscv/Modal';

import TabularBook from '#components/other/TabularBook';
import LeadPreview from '#components/leftpanel/LeadPreview';

import { leadAddSetLeadTabularBookAction } from '#redux';

import {
    leadKeySelector,
    leadFaramValuesSelector,
} from '../../utils';

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

function LeadPreviewWithTabular(props) {
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

    const values = leadFaramValuesSelector(lead);
    const {
        project: projectId,
        attachment,
        title,
        tabularBook,
    } = values;

    return (
        <>
            <LeadPreview
                key={tabularChangeKey}
                className={className}
                lead={values}
                onTabularButtonClick={handleTabularButtonClick}
                tabularBookExtractionDisabled={false}
            />
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
                            fileId={attachment?.id}
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
        </>
    );
}

LeadPreviewWithTabular.propTypes = propTypes;
LeadPreviewWithTabular.defaultProps = defaultProps;

const mapDispatchToProps = dispatch => ({
    onTabularBookSet: params => dispatch(leadAddSetLeadTabularBookAction(params)),
});
export default connect(null, mapDispatchToProps)(
    LeadPreviewWithTabular,
);
