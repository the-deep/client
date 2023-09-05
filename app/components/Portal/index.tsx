import React, { memo } from 'react';
import { createPortal } from 'react-dom';

export interface Props {
    children: React.ReactNode;
    element?: HTMLDivElement;
}

function Portal(props: Props) {
    const {
        children,
        element,
    } = props;

    return (
        <>
            {createPortal(
                children,
                element ?? document.body,
            )}
        </>
    );
}

export default memo(Portal);
