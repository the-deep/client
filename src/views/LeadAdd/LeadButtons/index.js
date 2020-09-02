import React, { useState, useCallback, useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
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

import { formatTitle } from '#utils/common';

import {
    leadAddPageActiveSourceSelector,
    leadAddSetActiveSourceAction,
} from '#redux';

import {
    LEAD_TYPE,
    supportedGoogleDriveMimeTypes,
    supportedDropboxExtension,
    supportedFileTypes,
} from '../utils';
import { LeadProcessorContext } from '../LeadProcessor';

import LeadButton from './LeadButton';
import styles from './styles.scss';

function LeadButtons(props) {
    const {
        className,
        onSourceChange,
        activeSource,
        onLeadsAdd,
    } = props;

    // NOTE: dropbox button must be manually disabled and enabled unlike
    // google-drive which creates an overlay and disables everything in bg
    const [dropboxDisabled, setDropboxDisabled] = useState(false);
    // NOTE: google drive access token is received at start
    const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState(false);

    const {
        addProcessingLeads,
    } = useContext(LeadProcessorContext);

    const handleGoogleDriveOnAuthenticated = useCallback((accessToken) => {
        if (accessToken) {
            // NOTE: use this token later during upload
            setGoogleDriveAccessToken(accessToken);
        } else {
            // TODO: use strings
            notify.send({
                title: 'Google Drive',
                type: notify.type.ERROR,
                message: 'Authentication with google drive failed!',
                duration: notify.duration.SLOW,
            });
        }
    }, [setGoogleDriveAccessToken]);

    const handleDropboxChooserClick = useCallback(() => {
        setDropboxDisabled(true);
    }, [setDropboxDisabled]);

    const handleDropboxChooserClose = useCallback(() => {
        setDropboxDisabled(true);
    }, [setDropboxDisabled]);

    const handleLeadAddFromText = useCallback(() => {
        const lead = {
            faramValues: {
                sourceType: LEAD_TYPE.text,
            },
        };

        onLeadsAdd([lead]);
    }, [onLeadsAdd]);

    const handleLeadAddFromWebsite = useCallback(() => {
        const lead = {
            faramValues: {
                sourceType: LEAD_TYPE.website,
                emmTriggers: [],
                emmEntities: [],
            },
        };

        onLeadsAdd([lead]);
    }, [onLeadsAdd]);

    const handleLeadAddFromDisk = useCallback((files, options) => {
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
        const newLeads = files.map((file) => {
            const lead = {
                faramValues: {
                    title: formatTitle(file.name),
                    sourceType: LEAD_TYPE.file,
                },
                file,
            };
            return lead;
        });
        addProcessingLeads(newLeads);
    }, [addProcessingLeads]);

    const handleLeadAddFromGoogleDrive = useCallback((response) => {
        const {
            docs,
            action,
        } = response;

        if (action !== 'picked') {
            console.error('No files selected to upload');
            return;
        }

        const newLeads = docs.map(doc => ({
            faramValues: {
                title: doc.name,
                sourceType: LEAD_TYPE.drive,
            },
            drive: {
                accessToken: googleDriveAccessToken,
                title: doc.name,
                fileId: doc.id,
                mimeType: doc.mimeType,
            },
        }));
        addProcessingLeads(newLeads);
    }, [addProcessingLeads, googleDriveAccessToken]);

    const handleLeadAddFromDropbox = useCallback((response) => {
        if (response.length <= 0) {
            console.error('No files selected to upload');
            return;
        }

        const newLeads = response.map(doc => ({
            faramValues: {
                title: doc.name,
                sourceType: LEAD_TYPE.dropbox,
            },
            dropbox: {
                title: doc.name,
                fileUrl: doc.link,
            },
        }));

        addProcessingLeads(newLeads);
        handleDropboxChooserClose();
    }, [addProcessingLeads, handleDropboxChooserClose]);

    return (
        <div className={_cs(styles.addLeadButtons, className)}>
            <h4 className={styles.heading}>
                {_ts('addLeads.sourceButtons', 'addSourceFromLabel')}
            </h4>
            <LeadButton
                source={LEAD_TYPE.file}
                active={activeSource === LEAD_TYPE.file}
                title={_ts('addLeads.sourceButtons', 'localDiskLabel')}
                onClick={onSourceChange}
            >
                <FileInput
                    onChange={handleLeadAddFromDisk}
                    showStatus={false}
                    multiple
                    accept={supportedFileTypes}
                >
                    <Icon name="add" />
                </FileInput>
            </LeadButton>
            <LeadButton
                source={LEAD_TYPE.website}
                active={activeSource === LEAD_TYPE.website}
                title={_ts('addLeads.sourceButtons', 'websiteLabel')}
                onClick={onSourceChange}
            >
                <Button
                    transparent
                    onClick={handleLeadAddFromWebsite}
                >
                    <Icon name="add" />
                </Button>
            </LeadButton>
            <LeadButton
                source={LEAD_TYPE.text}
                active={activeSource === LEAD_TYPE.text}
                title={_ts('addLeads.sourceButtons', 'textLabel')}
                onClick={onSourceChange}
            >
                <Button
                    transparent
                    onClick={handleLeadAddFromText}
                >
                    <Icon name="add" />
                </Button>
            </LeadButton>


            <LeadButton
                source={LEAD_TYPE.drive}
                active={activeSource === LEAD_TYPE.drive}
                title={_ts('addLeads.sourceButtons', 'googleDriveLabel')}
                onClick={onSourceChange}
            >
                <GooglePicker
                    clientId={googleDriveClientId}
                    developerKey={googleDriveDeveloperKey}
                    onAuthenticate={handleGoogleDriveOnAuthenticated}
                    onChange={handleLeadAddFromGoogleDrive}
                    mimeTypes={supportedGoogleDriveMimeTypes}
                    multiselect
                    navHidden
                >
                    <Icon name="add" />
                </GooglePicker>
            </LeadButton>

            <LeadButton
                source={LEAD_TYPE.dropbox}
                active={activeSource === LEAD_TYPE.dropbox}
                title={_ts('addLeads.sourceButtons', 'dropboxLabel')}
                onClick={onSourceChange}
            >
                <DropboxChooser
                    appKey={dropboxAppKey}
                    multiselect
                    extensions={supportedDropboxExtension}
                    success={handleLeadAddFromDropbox}
                    disabled={dropboxDisabled}
                    onClick={handleDropboxChooserClick}
                    cancel={handleDropboxChooserClose}
                >
                    <Icon name="add" />
                </DropboxChooser>
            </LeadButton>

            <LeadButton
                source={LEAD_TYPE.connectors}
                active={activeSource === LEAD_TYPE.connectors}
                title={_ts('addLeads.sourceButtons', 'connectorsLabel')}
                onClick={onSourceChange}
            />
        </div>
    );
}

LeadButtons.propTypes = {
    onSourceChange: PropTypes.func.isRequired,
    onLeadsAdd: PropTypes.func.isRequired,
    className: PropTypes.string,
    activeSource: PropTypes.string.isRequired,
};

LeadButtons.defaultProps = {
    className: undefined,
};

const mapStateToProps = state => ({
    activeSource: leadAddPageActiveSourceSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onSourceChange: params => dispatch(leadAddSetActiveSourceAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    LeadButtons,
);
