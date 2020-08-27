import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

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

import { formatTitle } from '#utils/common';

import {
    LEAD_TYPE,
    supportedGoogleDriveMimeTypes,
    supportedDropboxExtension,
    supportedFileTypes,
    getFaramValuesFromLeadCandidate,
} from '../utils';

import ConnectorSelectModal from './ConnectorSelectModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);

function LeadButtons(props) {
    const {
        leads,
        onLeadsAdd,
        className,
    } = props;

    // NOTE: dropbox button must be manually disabled and enabled unlike
    // google-drive which creates an overlay and disables everything in bg
    const [dropboxDisabled, setDropboxDisabled] = useState(false);
    // NOTE: google drive access token is received at start
    const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState(false);

    const handleGoogleDriveOnAuthenticated = useCallback((accessToken) => {
        if (accessToken) {
            // NOTE: use this token later during upload
            setGoogleDriveAccessToken(accessToken);
        } else {
            // FIXME: use strings
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
        onLeadsAdd(newLeads);
    }, [onLeadsAdd]);

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
        onLeadsAdd(newLeads);
    }, [onLeadsAdd, googleDriveAccessToken]);

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

        onLeadsAdd(newLeads);
        handleDropboxChooserClose();
    }, [onLeadsAdd, handleDropboxChooserClose]);

    const handleLeadAddFromConnectors = useCallback((selectedLeads) => {
        if (selectedLeads.length <= 0) {
            console.error('No files selected to upload');
            return;
        }

        const newLeads = selectedLeads.map(lead => ({
            faramValues: getFaramValuesFromLeadCandidate(lead),
        }));

        onLeadsAdd(newLeads);
    }, [onLeadsAdd]);

    return (
        <div className={_cs(styles.addLeadButtons, className)}>
            <h4 className={styles.heading}>
                {_ts('addLeads.sourceButtons', 'addSourceFromLabel')}
            </h4>
            <div className={styles.item}>
                <div className={styles.leftContainer}>
                    <Icon
                        className={styles.icon}
                        name="upload"
                    />
                    {_ts('addLeads.sourceButtons', 'localDiskLabel')}
                </div>
                <FileInput
                    className={_cs(styles.addLeadBtn, styles.fileInput)}
                    onChange={handleLeadAddFromDisk}
                    showStatus={false}
                    multiple
                    accept={supportedFileTypes}
                >
                    <Icon name="add" />
                </FileInput>
            </div>
            <div className={styles.item}>
                <div className={styles.leftContainer}>
                    <Icon
                        className={styles.icon}
                        name="globe"
                    />
                    {_ts('addLeads.sourceButtons', 'websiteLabel')}
                </div>
                <Button
                    className={styles.addLeadBtn}
                    transparent
                    onClick={handleLeadAddFromWebsite}
                >
                    <Icon name="add" />
                </Button>
            </div>
            <div className={styles.item}>
                <div className={styles.leftContainer}>
                    <Icon
                        className={styles.icon}
                        name="clipboard"
                    />
                    {_ts('addLeads.sourceButtons', 'textLabel')}
                </div>
                <Button
                    className={styles.addLeadBtn}
                    transparent
                    onClick={handleLeadAddFromText}
                >
                    <Icon name="add" />
                </Button>
            </div>
            <div className={styles.item}>
                <div className={styles.leftContainer}>
                    <Icon
                        className={styles.icon}
                        name="googleDrive"
                    />
                    {_ts('addLeads.sourceButtons', 'googleDriveLabel')}
                </div>
                <GooglePicker
                    className={styles.addLeadBtn}
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
            </div>
            <div className={styles.item}>
                <div className={styles.leftContainer}>
                    <Icon
                        className={styles.icon}
                        name="dropbox"
                    />
                    {_ts('addLeads.sourceButtons', 'dropboxLabel')}
                </div>
                <DropboxChooser
                    className={styles.addLeadBtn}
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
            </div>
            <div className={styles.item}>
                <div className={styles.leftContainer}>
                    <Icon
                        className={styles.icon}
                        name="link"
                    />
                    {_ts('addLeads.sourceButtons', 'connectorsLabel')}
                </div>
                <ModalButton
                    className={styles.addLeadBtn}
                    transparent
                    modal={
                        <ConnectorSelectModal
                            leads={leads}
                            onLeadsSelect={handleLeadAddFromConnectors}
                        />
                    }
                >
                    <Icon name="add" />
                </ModalButton>
            </div>
        </div>
    );
}

LeadButtons.propTypes = {
    onLeadsAdd: PropTypes.func.isRequired,
    className: PropTypes.string,
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

LeadButtons.defaultProps = {
    className: undefined,
    leads: [],
};

export default LeadButtons;
