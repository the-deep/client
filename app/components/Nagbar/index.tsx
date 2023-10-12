import React, { useState, useCallback } from 'react';
import {
    IoCloseOutline,
} from 'react-icons/io5';
import {
    QuickActionButton,
    Link,
} from '@the-deep/deep-ui';

import useLocalStorage from '#hooks/useLocalStorage';

import styles from './styles.css';

const releaseVersion = process.env.REACT_APP_RELEASE_VERSION;
const wikiLink = `https://github.com/the-deep/deeper/wiki/${releaseVersion}`;

function Nagbar() {
    const [
        nagbarShown,
        setNagbarShown,
    ] = useState<boolean>(true);

    const [
        releaseNoteSeen,
        setReleaseNoteSeen,
    ] = useLocalStorage<boolean>('release-note-seen', false);

    const handleClose = useCallback(() => {
        setNagbarShown(false);
        setReleaseNoteSeen(true);
    }, [
        setReleaseNoteSeen,
    ]);

    if (!nagbarShown || releaseNoteSeen) {
        return null;
    }

    return (
        <div className={styles.nagbar}>
            <div className={styles.content}>
                DEEP has been updated to
                &nbsp;
                {releaseVersion}
                .
                &nbsp;
                Read
                &nbsp;
                <Link
                    to={wikiLink}
                    actionsContainerClassName={styles.linkIcon}
                >
                    release notes
                </Link>
                .
            </div>

            <QuickActionButton
                name={undefined}
                onClick={handleClose}
                variant="transparent"
            >
                <IoCloseOutline />
            </QuickActionButton>
        </div>
    );
}

export default Nagbar;
