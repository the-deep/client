import React, { useState, useEffect, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
} from '@the-deep/deep-ui';
import useScript from '#hooks/useScript';
import _ts from '#ts';

import styles from './styles.css';

interface Props {
    className?: string;
    clientId: string;
    developerKey: string;
    onChange: (response: google.picker.ResponseObject) => void;
    scope?: string;
    disabled?: boolean;
    children?: React.ReactNode;
    onAuthenticateSuccess?: (token: string) => void;
    mimeTypes?: string;
    multiSelect?: boolean;
    navHidden?: boolean;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
}

function GoogleDrivePicker(props: Props) {
    const {
        className,
        clientId,
        developerKey,
        scope = 'https://www.googleapis.com/auth/drive.readonly',
        disabled,
        icons,
        iconsContainerClassName,
        children,
        onChange,
        onAuthenticateSuccess,
        mimeTypes,
        multiSelect,
        navHidden,
    } = props;

    const gapiStatus = useScript('https://apis.google.com/js/api.js');
    const gisStatus = useScript('https://accounts.google.com/gsi/client');
    const [gisLoaded, setGisLoaded] = useState(false);
    const [pickerApiLoaded, setPickerApiLoaded] = useState(false);

    const onPickerApiLoad = useCallback(() => {
        setPickerApiLoaded(true);
    }, []);

    useEffect(() => {
        if (gapiStatus === 'ready') {
            window.gapi.load('picker', { callback: onPickerApiLoad });
        }
        if (gisStatus === 'ready') {
            setGisLoaded(true);
        }
    }, [gapiStatus, onPickerApiLoad, gisStatus]);

    const createPicker = useCallback((authToken: string) => {
        if (onAuthenticateSuccess) {
            onAuthenticateSuccess(authToken);
        }
        const view = new window.google.picker
            .DocsView(window.google.picker.ViewId.FOLDERS)
            .setOwnedByMe(true);

        if (mimeTypes) {
            view.setMimeTypes(mimeTypes);
        }
        const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(authToken)
            .setDeveloperKey(developerKey)
            .setCallback(onChange);

        if (navHidden) {
            picker.enableFeature(window.google.picker.Feature.NAV_HIDDEN);
        }
        if (multiSelect) {
            picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        }

        picker.build().setVisible(true);
    }, [
        developerKey,
        mimeTypes,
        multiSelect,
        navHidden,
        onAuthenticateSuccess,
        onChange,
    ]);

    const handleClick = useCallback(() => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope,
            error_callback: (response) => {
                console.warn('response', response);
            },
            callback: (response) => {
                if (response.access_token === null) {
                    tokenClient.requestAccessToken({ prompt: 'consent' });
                }

                if (response.access_token) {
                    createPicker(response.access_token);
                }
            },
        });

        tokenClient.requestAccessToken({ prompt: '' });
    }, [
        clientId,
        scope,
        createPicker,
    ]);

    return (
        <Button
            name="google-drive-button"
            variant="action"
            className={_cs(className, styles.googlePicker)}
            onClick={handleClick}
            icons={icons}
            iconsContainerClassName={iconsContainerClassName}
            disabled={disabled || !(gisLoaded && pickerApiLoaded)}
        >
            {children || _ts('components.googlePicker', 'openGoogleChooserText')}
        </Button>
    );
}

export default GoogleDrivePicker;
