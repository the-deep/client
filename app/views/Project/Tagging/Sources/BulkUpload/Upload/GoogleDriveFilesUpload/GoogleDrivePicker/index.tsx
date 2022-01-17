import React, { useState, useEffect, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
} from '@the-deep/deep-ui';
import _ts from '#ts';

import styles from './styles.css';

const pollTime = 3000;

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

    const [loaded, setLoaded] = useState(!!window.gapi);
    const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
    const [authApiLoaded, setAuthApiLoaded] = useState(false);

    const onAuthApiLoad = useCallback(() => {
        setAuthApiLoaded(true);
    }, []);

    const onPickerApiLoad = useCallback(() => {
        setPickerApiLoaded(true);
    }, []);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (loaded) {
            window.gapi.load('auth2', { callback: onAuthApiLoad });
            window.gapi.load('picker', { callback: onPickerApiLoad });
        } else {
            timeout = setTimeout(() => setLoaded(!!window.gapi), pollTime);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [loaded, onAuthApiLoad, onPickerApiLoad]);

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

    const handleAuthResult = useCallback((result: gapi.auth2.AuthorizeResponse) => {
        if (result.access_token) {
            createPicker(result.access_token);
        } else {
            // eslint-disable-next-line no-console
            console.error('google auth response', result.error);
        }
    }, [createPicker]);

    const handleClick = useCallback(() => {
        window.gapi.auth2.authorize({
            client_id: clientId,
            scope,
        }, handleAuthResult);
    }, [
        clientId,
        scope,
        handleAuthResult,
    ]);

    return (
        <Button
            name="google-drive-button"
            variant="action"
            className={_cs(className, styles.googlePicker)}
            onClick={handleClick}
            icons={icons}
            iconsContainerClassName={iconsContainerClassName}
            disabled={disabled || !(authApiLoaded && pickerApiLoaded)}
        >
            {children || _ts('components.googlePicker', 'openGoogleChooserText')}
        </Button>
    );
}

export default GoogleDrivePicker;
