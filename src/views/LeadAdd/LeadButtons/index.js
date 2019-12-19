import PropTypes from 'prop-types';
import React from 'react';
import { formatDateToString } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import FileInput from '#rsci/FileInput';

import DropboxChooser from '#components/importer/DropboxChooser';
import GooglePicker from '#components/importer/GooglePicker';

import { dropboxAppKey } from '#config/dropbox';
import {
    googleDriveClientId,
    googleDriveDeveloperKey,
} from '#config/google-drive';

import notify from '#notify';
import _ts from '#ts';

import {
    LEAD_TYPE,
    supportedGoogleDriveMimeTypes,
    supportedDropboxExtension,
    supportedFileTypes,
} from '../utils';

import ConnectorSelectModal from './ConnectorSelectModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    onLeadsAdd: PropTypes.func.isRequired,
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    leads: [],
};

export default class LeadButtons extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            // NOTE: dropbox button must be manually disabled and enabled unlike
            // google-drive which creates an overlay and disables everything in bg
            dropboxDisabled: false,
        };

        // NOTE: google drive access token is received at start
        this.googleDriveAccessToken = undefined;
    }

    handleGoogleDriveOnAuthenticated = (accessToken) => {
        if (accessToken) {
            // NOTE: use this token later during upload
            this.googleDriveAccessToken = accessToken;
        } else {
            // FIXME: use strings
            notify.send({
                title: 'Google Drive',
                type: notify.type.ERROR,
                message: 'Authentication with google drive failed!',
                duration: notify.duration.SLOW,
            });
        }
    }

    handleDropboxChooserClick = () => {
        this.setState({ dropboxDisabled: true });
    }

    handleDropboxChooserClose = () => {
        this.setState({ dropboxDisabled: false });
    }

    handleLeadAddFromText = () => {
        const {
            onLeadsAdd,
        } = this.props;

        const lead = {
            faramValues: {
                sourceType: LEAD_TYPE.text,
            },
        };

        onLeadsAdd([lead]);
    }

    handleLeadAddFromWebsite = () => {
        const {
            onLeadsAdd,
        } = this.props;

        const lead = {
            faramValues: {
                sourceType: LEAD_TYPE.website,
                emmTriggers: [],
                emmEntities: [],
            },
        };

        onLeadsAdd([lead]);
    }

    handleLeadAddFromDisk = (files, options) => {
        const { invalidFiles } = options;

        if (invalidFiles > 0) {
            notify.send({
                title: _ts('addLeads.sourceButtons', 'fileSelection'),
                type: notify.type.WARNING,
                message: _ts('addLeads.sourceButtons', 'invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.error('No files selected to upload');
            return;
        }

        const {
            onLeadsAdd,
        } = this.props;

        const leads = files.map((file) => {
            const lead = {
                faramValues: {
                    title: file.name,
                    sourceType: LEAD_TYPE.file,
                },
                file,
            };
            return lead;
        });
        onLeadsAdd(leads);
    }

    handleLeadAddFromGoogleDrive = (response) => {
        const {
            docs,
            action,
        } = response;

        if (action !== 'picked') {
            console.error('No files selected to upload');
            return;
        }

        const {
            onLeadsAdd,
        } = this.props;

        const leads = docs.map(doc => ({
            faramValues: {
                title: doc.name,
                sourceType: LEAD_TYPE.drive,
            },
            drive: {
                accessToken: this.googleDriveAccessToken,
                title: doc.name,
                fileId: doc.id,
                mimeType: doc.mimeType,
            },
        }));
        onLeadsAdd(leads);
    }

    handleLeadAddFromDropbox = (response) => {
        if (response.length <= 0) {
            console.error('No files selected to upload');
            return;
        }
        const {
            onLeadsAdd,
        } = this.props;

        const leads = response.map(doc => ({
            faramValues: {
                title: doc.name,
                sourceType: LEAD_TYPE.dropbox,
            },
            drive: {
                title: doc.name,
                fileUrl: doc.link,
            },
        }));

        onLeadsAdd(leads);
        this.handleDropboxChooserClose();
    }

    handleLeadAddFromConnectors = (selectedLeads) => {
        if (selectedLeads.length <= 0) {
            console.error('No files selected to upload');
            return;
        }

        const {
            onLeadsAdd,
        } = this.props;

        const leads = selectedLeads.map(lead => ({
            faramValues: {
                title: lead.title,
                website: lead.website,
                url: lead.url,
                publishedOn: formatDateToString(new Date(lead.publishedOn), 'yyyy-MM-dd'),
                source: lead.source,
                author: lead.author,
                // sourceDetail: lead.sourceDetail,
                // authorDetail: lead.authorDetail,
                sourceSuggestion: lead.sourceRaw,
                authorSuggestion: lead.authorRaw,
                sourceType: LEAD_TYPE.website,
                emmEntities: lead.emmEntities,
                emmTriggers: lead.emmTriggers,
            },
        }));

        onLeadsAdd(leads);
    }

    render() {
        const { leads } = this.props;
        const { dropboxDisabled } = this.state;

        return (
            <div className={styles.addLeadButtons}>
                <h3 className={styles.heading}>
                    {_ts('addLeads.sourceButtons', 'addSourceFromLabel')}
                </h3>

                <GooglePicker
                    className={styles.addLeadBtn}
                    clientId={googleDriveClientId}
                    developerKey={googleDriveDeveloperKey}
                    onAuthenticate={this.handleGoogleDriveOnAuthenticated}
                    onChange={this.handleLeadAddFromGoogleDrive}
                    mimeTypes={supportedGoogleDriveMimeTypes}
                    multiselect
                    navHidden
                >
                    <Icon name="googleDrive" />
                    <p>
                        {_ts('addLeads.sourceButtons', 'googleDriveLabel')}
                    </p>
                </GooglePicker>

                <DropboxChooser
                    className={styles.addLeadBtn}
                    appKey={dropboxAppKey}
                    multiselect
                    extensions={supportedDropboxExtension}
                    success={this.handleLeadAddFromDropbox}
                    disabled={dropboxDisabled}
                    onClick={this.handleDropboxChooserClick}
                    cancel={this.handleDropboxChooserClose}
                >
                    <Icon name="dropbox" />
                    <p>
                        {_ts('addLeads.sourceButtons', 'dropboxLabel')}
                    </p>
                </DropboxChooser>

                <FileInput
                    className={styles.addLeadBtn}
                    onChange={this.handleLeadAddFromDisk}
                    showStatus={false}
                    multiple
                    accept={supportedFileTypes}
                >
                    <Icon name="upload" />
                    <p>
                        {_ts('addLeads.sourceButtons', 'localDiskLabel')}
                    </p>
                </FileInput>
                <Button
                    className={styles.addLeadBtn}
                    transparent
                    onClick={this.handleLeadAddFromWebsite}
                >
                    <Icon name="globe" />
                    <p>
                        {_ts('addLeads.sourceButtons', 'websiteLabel')}
                    </p>
                </Button>
                <Button
                    className={styles.addLeadBtn}
                    transparent
                    onClick={this.handleLeadAddFromText}
                >
                    <Icon name="clipboard" />
                    <p>
                        {_ts('addLeads.sourceButtons', 'textLabel')}
                    </p>
                </Button>
                <ModalButton
                    className={styles.addLeadBtn}
                    transparent
                    modal={
                        <ConnectorSelectModal
                            leads={leads}
                            onLeadsSelect={this.handleLeadAddFromConnectors}
                        />
                    }
                >
                    <Icon name="link" />
                    <p>
                        {_ts('addLeads.sourceButtons', 'connectorsLabel')}
                    </p>
                </ModalButton>
            </div>
        );
    }
}
