import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { ElementFragments, QuickActionButton } from '@the-deep/deep-ui';
import { IoTrashBinOutline } from 'react-icons/io5';

import styles from './styles.css';

interface Props {
    id: string;
    value: string;
    className?: string;
    onDismiss: (value: string) => void;
}

function GeoAreaListItem(props: Props) {
    const {
        id,
        value,
        className,
        onDismiss,
    } = props;

    const handleDismissButtonClick = useCallback(
        () => {
            onDismiss(id);
        },
        [onDismiss, id],
    );
    return (
        <div className={_cs(className, styles.geoAreaListItem)}>
            <ElementFragments
                actions={(
                    <QuickActionButton
                        name="delete"
                        onClick={handleDismissButtonClick}
                        title="Remove item"
                    >
                        <IoTrashBinOutline />
                    </QuickActionButton>
                )}
            >
                {value}
            </ElementFragments>
        </div>
    );
}

export default GeoAreaListItem;
