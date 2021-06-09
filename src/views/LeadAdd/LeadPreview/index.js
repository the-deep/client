import React from 'react';
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
    className: '',
};

class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showTabularModal: false,
            tabularChangeKey: 1,
            tabularFileType: undefined,
        };
    }

    handleTabularButtonClick = (response) => {
        const {
            fileType,
        } = response;

        this.setState({
            showTabularModal: true,
            tabularFileType: fileType,
        });
    }

    handleTabularModalClose = () => {
        const { tabularChangeKey } = this.state;

        this.setState({
            showTabularModal: false,
            tabularFileType: undefined,
            tabularChangeKey: tabularChangeKey + 1,
        });
    }

    handleTabularBookDelete = () => {
        const {
            lead,
            onTabularBookSet,
        } = this.props;
        const leadKey = leadKeySelector(lead);
        onTabularBookSet({ leadKey, tabularBook: undefined });
        this.handleTabularModalClose();
    }

    handleTabularBookSet = (tabularBook) => {
        const {
            lead,
            onTabularBookSet,
        } = this.props;
        const leadKey = leadKeySelector(lead);
        onTabularBookSet({ leadKey, tabularBook });
    }

    render() {
        const {
            className,
            lead,
        } = this.props;
        const {
            showTabularModal,
            tabularFileType,
            tabularChangeKey,
        } = this.state;

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
                        { isTruthyString(url) ? (
                            <ExternalGallery
                                className={styles.galleryFile}
                                url={url}
                                showUrl
                            />
                        ) : (
                            <Message className={className}>
                                {_ts('addLeads', 'sourcePreview')}
                            </Message>
                        ) }
                    </div>
                );
            default:
                return (
                    <div className={className} >
                        { isDefined(attachment) ? (
                            <Attachment
                                key={tabularChangeKey}
                                attachment={attachment}
                                title={title}
                                tabularBook={tabularBook}
                                className={styles.galleryFile}
                                projectId={projectId}
                                onTabularButtonClick={this.handleTabularButtonClick}
                            />
                        ) : (
                            <Message>
                                {_ts('addLeads', 'previewNotAvailable')}
                            </Message>
                        ) }
                        { showTabularModal && (
                            <Modal
                                className={styles.tabularModal}
                                onClose={this.handleTabularModalClose}
                            >
                                {
                                    tabularBook || tabularFileType !== 'csv' ? (
                                        <TabularBook
                                            leadTitle={title}
                                            className={styles.tabularBook}
                                            bookId={tabularBook}
                                            projectId={projectId}
                                            onDelete={this.handleTabularBookDelete}
                                            onCancel={this.handleTabularModalClose}
                                            fileId={attachment.id}
                                            fileType={tabularFileType}
                                            onTabularBookCreate={this.handleTabularBookSet}
                                        />
                                    ) : (
                                        <LeadTabular
                                            fileType={tabularFileType}
                                            setTabularBook={this.handleTabularBookSet}
                                            onCancel={this.handleTabularModalClose}
                                            lead={lead}
                                        />
                                    )
                                }
                            </Modal>
                        ) }
                    </div>
                );
        }
    }
}

export default LeadPreview;
