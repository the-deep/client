import React, { useState, useCallback, useContext, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { _cs, listToGroupList, mapToMap } from '@togglecorp/fujs';

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
    leadAddPageLeadsSelector,
} from '#redux';

import {
    LEAD_TYPE,
    LEAD_STATUS,
    leadKeySelector,
    supportedGoogleDriveMimeTypes,
    supportedDropboxExtension,
    supportedFileTypes,
    leadSourceTypeSelector,
} from '../utils';
import { LeadProcessorContext } from '../LeadProcessor';

import LeadListItem from '../LeadListItem';
import styles from './styles.scss';

function LeadSources(props) {
    const {
        className,
        onSourceChange,
        activeSource,
        onLeadsAdd,
        leadStates,
        leads,
    } = props;

    const leadsBySource = useMemo(
        () => listToGroupList(
            leads,
            leadSourceTypeSelector,
            item => item,
        ),
        [leads],
    );

    const counts = useMemo(
        () => mapToMap(
            leadsBySource,
            key => key,
            l => l.length,
        ),
        [leadsBySource],
    );

    const sourceStates = useMemo(
        () => mapToMap(
            leadsBySource,
            key => key,
            (l) => {
                const leadsKeys = l.map(leadKeySelector);
                if (leadsKeys.some(key => leadStates[key] === LEAD_STATUS.invalid)) {
                    return LEAD_STATUS.invalid;
                }
                if (leadsKeys.some(key => leadStates[key] === LEAD_STATUS.requesting)) {
                    return LEAD_STATUS.requesting;
                }
                if (leadsKeys.some(key => leadStates[key] === LEAD_STATUS.nonPristine)) {
                    return LEAD_STATUS.nonPristine;
                }
                if (leadsKeys.every(key => leadStates[key] === LEAD_STATUS.complete)) {
                    return LEAD_STATUS.complete;
                }
                return LEAD_STATUS.pristine;
            },
        ),
        [leadsBySource, leadStates],
    );

    // NOTE: dropbox button must be manually disabled and enabled unlike
    // google-drive which creates an overlay and disables everything in bg
    const [dropboxDisabled, setDropboxDisabled] = useState(false);
    // NOTE: google drive access token is received at start
    const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState(false);

    const {
        addCandidateLeads,
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
        addCandidateLeads(newLeads);
    }, [addCandidateLeads]);

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
        addCandidateLeads(newLeads);
    }, [addCandidateLeads, googleDriveAccessToken]);

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

        addCandidateLeads(newLeads);
        handleDropboxChooserClose();
    }, [addCandidateLeads, handleDropboxChooserClose]);

    return (
        <div className={_cs(styles.addLeadSources, className)}>
            <h4 className={styles.heading}>
                {_ts('addLeads.sourceButtons', 'addSourceFromLabel')}
            </h4>
            <LeadListItem
                count={counts[LEAD_TYPE.file]}
                itemKey={LEAD_TYPE.file}
                type={LEAD_TYPE.file}
                active={activeSource === LEAD_TYPE.file}
                title={_ts('addLeads.sourceButtons', 'localDiskLabel')}
                onItemSelect={onSourceChange}
                itemState={sourceStates[LEAD_TYPE.file]}
                actionButtons={(
                    <FileInput
                        onChange={handleLeadAddFromDisk}
                        showStatus={false}
                        multiple
                        accept={supportedFileTypes}
                    >
                        <Icon name="add" />
                    </FileInput>
                )}
            />
            <LeadListItem
                itemKey={LEAD_TYPE.website}
                type={LEAD_TYPE.website}
                active={activeSource === LEAD_TYPE.website}
                title={_ts('addLeads.sourceButtons', 'websiteLabel')}
                onItemSelect={onSourceChange}
                count={counts[LEAD_TYPE.website]}
                itemState={sourceStates[LEAD_TYPE.website]}
                actionButtons={(
                    <Button
                        transparent
                        onClick={handleLeadAddFromWebsite}
                    >
                        <Icon name="add" />
                    </Button>
                )}
            />
            <LeadListItem
                itemKey={LEAD_TYPE.text}
                type={LEAD_TYPE.text}
                active={activeSource === LEAD_TYPE.text}
                title={_ts('addLeads.sourceButtons', 'textLabel')}
                onItemSelect={onSourceChange}
                count={counts[LEAD_TYPE.text]}
                itemState={sourceStates[LEAD_TYPE.text]}
                actionButtons={(
                    <Button
                        transparent
                        onClick={handleLeadAddFromText}
                    >
                        <Icon name="add" />
                    </Button>
                )}
            />
            <LeadListItem
                itemKey={LEAD_TYPE.drive}
                type={LEAD_TYPE.drive}
                active={activeSource === LEAD_TYPE.drive}
                title={_ts('addLeads.sourceButtons', 'googleDriveLabel')}
                onItemSelect={onSourceChange}
                count={counts[LEAD_TYPE.drive]}
                itemState={sourceStates[LEAD_TYPE.drive]}
                actionButtons={(
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
                )}
            />
            <LeadListItem
                itemKey={LEAD_TYPE.dropbox}
                type={LEAD_TYPE.dropbox}
                active={activeSource === LEAD_TYPE.dropbox}
                title={_ts('addLeads.sourceButtons', 'dropboxLabel')}
                onItemSelect={onSourceChange}
                count={counts[LEAD_TYPE.dropbox]}
                itemState={sourceStates[LEAD_TYPE.dropbox]}
                actionButtons={(
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
                )}
            />
            <LeadListItem
                itemKey={LEAD_TYPE.connectors}
                type={LEAD_TYPE.connectors}
                active={activeSource === LEAD_TYPE.connectors}
                title={_ts('addLeads.sourceButtons', 'connectorsLabel')}
                onItemSelect={onSourceChange}
                count={counts[LEAD_TYPE.connectors]}
                itemState={sourceStates[LEAD_TYPE.connectors]}
            />
        </div>
    );
}

LeadSources.propTypes = {
    onSourceChange: PropTypes.func.isRequired,
    onLeadsAdd: PropTypes.func.isRequired,
    className: PropTypes.string,
    activeSource: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array.isRequired,
};

LeadSources.defaultProps = {
    className: undefined,
};

const mapStateToProps = state => ({
    activeSource: leadAddPageActiveSourceSelector(state),
    leads: leadAddPageLeadsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onSourceChange: params => dispatch(leadAddSetActiveSourceAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    LeadSources,
);
