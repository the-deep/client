import React, { useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';

import { BasicOrganization } from '#typings';

export interface Props {
    className?: string;
    onRemove: (index: number) => void;
    value: BasicOrganization;
}

function StakeholderRow(props: Props) {
    const {
        className,
        onRemove,
        value,
    } = props;

    const handleClick = useCallback(() => {
        onRemove(value.id);
    }, [value.id, onRemove]);

    return (
        <div
            className={className}
        >
            <ElementFragments
                actions={(
                    <QuickActionButton
                        name={undefined}
                        onClick={handleClick}
                    >
                        <IoClose />
                    </QuickActionButton>
                )}
            >
                {value.title}
            </ElementFragments>
        </div>
    );
}

export default StakeholderRow;
