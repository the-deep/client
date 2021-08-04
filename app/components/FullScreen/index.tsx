import React from 'react';
import { Portal } from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    children?: React.ReactNode;
    className?: string;
}

function FullScreen(props: Props) {
    const {
        children,
        className,
    } = props;

    React.useEffect(() => {
        document.documentElement.requestFullscreen();

        return () => {
            document.exitFullscreen();
        };
    }, []);

    return (
        <Portal>
            <div className={_cs(styles.fullScreen, className)}>
                {children}
            </div>
        </Portal>
    );
}

export default FullScreen;
