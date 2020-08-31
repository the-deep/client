import React, { useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
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
import { LeadProcessorContext } from '../LeadProcessor';

import ConnectorSelectModal from './ConnectorSelectModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);

// FIXME: it doesn't make much sense to include the icon anymore
const leadTypeToIconClassMap = {
    [LEAD_TYPE.file]: 'upload',
    [LEAD_TYPE.website]: 'globe',
    [LEAD_TYPE.text]: 'clipboard',
    [LEAD_TYPE.drive]: 'googleDrive',
    [LEAD_TYPE.dropbox]: 'dropbox',
    [LEAD_TYPE.connectors]: 'link',
};

function LeadButton(props) {
    const {
        className,
        active,
        source,
        title,
        onClick,
        children,
    } = props;

    const handleClick = useCallback(() => {
        onClick(source);
    }, [onClick, source]);

    return (
        <div
            role="presentation"
            onClick={handleClick}
            className={
                _cs(
                    className,
                    styles.leadButton,
                    active && styles.active,
                )
            }
        >
            <Icon
                className={styles.icon}
                name={leadTypeToIconClassMap[source]}
            />
            <span className={styles.title} >
                { title }
            </span>
            <span className={styles.actions}>
                {children}
            </span>
        </div>
    );
}
LeadButton.propTypes = {
    className: PropTypes.string,
    active: PropTypes.bool,
    source: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
};
LeadButton.defaultProps = {
    className: undefined,
    active: false,
    children: undefined,
};

function LeadButtons(props) {
    const {
        leads,
        onSourceChange,
        className,
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

    const handleLeadAddFromConnectors = useCallback((selectedLeads) => {
        if (selectedLeads.length <= 0) {
            console.error('No files selected to upload');
            return;
        }

        const newLeads = selectedLeads.map(lead => ({
            faramValues: getFaramValuesFromLeadCandidate(lead),
        }));

        addProcessingLeads(newLeads);
    }, [addProcessingLeads]);

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
                    className={_cs(styles.addLeadBtn, styles.fileInput)}
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
                    className={styles.addLeadBtn}
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
                    className={styles.addLeadBtn}
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
            </LeadButton>

            <LeadButton
                source={LEAD_TYPE.dropbox}
                active={activeSource === LEAD_TYPE.dropbox}
                title={_ts('addLeads.sourceButtons', 'dropboxLabel')}
                onClick={onSourceChange}
            >
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
            </LeadButton>

            <LeadButton
                source={LEAD_TYPE.connectors}
                active={activeSource === LEAD_TYPE.connectors}
                title={_ts('addLeads.sourceButtons', 'connectorsLabel')}
                onClick={onSourceChange}
            >
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
            </LeadButton>
        </div>
    );
}

LeadButtons.propTypes = {
    onSourceChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeSource: PropTypes.string.isRequired,
};

LeadButtons.defaultProps = {
    className: undefined,
    leads: [],
};

export default LeadButtons;
