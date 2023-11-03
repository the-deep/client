import React, { useState, useMemo, useCallback } from 'react';
import {
    IoCloseOutline,
} from 'react-icons/io5';
import {
    QuickActionButton,
    Link,
} from '@the-deep/deep-ui';
import {
    isNotDefined,
} from '@togglecorp/fujs';

import useLocalStorage from '#hooks/useLocalStorage';

import styles from './styles.css';

const releaseVersion = process.env.REACT_APP_RELEASE_VERSION;
const wikiLink = `https://github.com/the-deep/deeper/wiki/DEEP-${releaseVersion}`;
const today = new Date().getTime();
const releaseTime = process.env.REACT_APP_RELEASE_TIME;
const releaseDate = new Date(releaseTime ?? '').getTime();

function Nagbar() {
    const [
        nagbarShown,
        setNagbarShown,
    ] = useState<boolean>(true);

    const [
        seenReleaseNote,
        setSeenReleaseNote,
    ] = useLocalStorage<string | undefined>('release-note-seen', undefined);

    const showNagbar = useMemo(() => {
        if (isNotDefined(releaseTime) || !nagbarShown) {
            return false;
        }
        const diff = Math.round((today - releaseDate) / (60 * 60 * 24 * 1000));
        if (diff < 0 || diff > 15) {
            return false;
        }

        return true;
    }, [
        nagbarShown,
    ]);

    const handleClose = useCallback(() => {
        setNagbarShown(false);
        setSeenReleaseNote(releaseVersion);
    }, [
        setSeenReleaseNote,
    ]);

    if ((seenReleaseNote === releaseVersion) || !showNagbar) {
        return null;
    }

    return (
        <div className={styles.nagbar}>
            <div className={styles.content}>
                DEEP has been updated to
                &#8204;
                {releaseVersion}
                .
                &#8204;
                <Link
                    to={wikiLink}
                    actionsContainerClassName={styles.linkIcon}
                    className={styles.link}
                >
                    Find the release notes here
                </Link>
                .
            </div>

            <QuickActionButton
                name={undefined}
                onClick={handleClose}
                variant="transparent"
                title="Dismiss"
            >
                <IoCloseOutline />
            </QuickActionButton>
        </div>
    );
}

export default Nagbar;
