import React, { useState, useEffect, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
} from '@the-deep/deep-ui';
import _ts from '#ts';

import styles from './styles.css';

export type DropboxLinkType = 'preview' | 'direct';

const pollTime = 3000;

interface Props {
    className?: string;
    onSuccess: (files: Dropbox.ChooserFile[]) => void;
    linkType?: DropboxLinkType;
    multiselect?: boolean;
    extensions?: string[];
    children?: React.ReactNode;
    disabled?: boolean;
    folderselect?: boolean;
    sizeLimit?: number;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
}

function DropboxPicker(props: Props) {
    const {
        className,
        onSuccess,
        linkType = 'direct',
        multiselect,
        extensions,
        folderselect,
        sizeLimit,
        children,
        disabled,
        icons,
        iconsContainerClassName,
    } = props;

    const [loaded, setLoaded] = useState(!!window.Dropbox);
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (!loaded) {
            timeout = setTimeout(() => setLoaded(!!window.Dropbox), pollTime);
        }
        return () => clearTimeout(timeout);
    }, [loaded]);

    const handleCancel = useCallback(() => {
        setIsOpened(false);
    }, []);

    const handleSuccess = useCallback((files: Dropbox.ChooserFile[]) => {
        setIsOpened(false);
        onSuccess(files);
    }, [onSuccess]);

    const handleClick = useCallback(() => {
        window.Dropbox?.choose({
            success: handleSuccess,
            cancel: handleCancel,
            linkType,
            multiselect,
            extensions,
            folderselect,
            sizeLimit,
        });
        setIsOpened(true);
    }, [
        linkType,
        multiselect,
        extensions,
        folderselect,
        sizeLimit,
        handleCancel,
        handleSuccess,
    ]);

    return (
        <Button
            name="dropbox-picker-button"
            className={_cs(styles.dropboxPicker, className)}
            variant="action"
            onClick={handleClick}
            disabled={disabled || !loaded || isOpened}
            icons={icons}
            iconsContainerClassName={iconsContainerClassName}
        >
            {children || _ts('components.dropboxChooser', 'openDropboxChooserText') }
        </Button>
    );
}

export default DropboxPicker;
