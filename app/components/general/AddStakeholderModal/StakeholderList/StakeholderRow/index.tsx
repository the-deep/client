import React, { useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';

export interface Props {
    className?: string;
    onRemove: (index: number) => void;
    value: number;
    displayValue?: string;
}

function StakeholderRow(props: Props) {
    const {
        className,
        onRemove,
        value,
        displayValue,
    } = props;

    const handleClick = useCallback(() => {
        onRemove(value);
    }, [value, onRemove]);

    return (
        <div className={className}>
            <ElementFragments
                actions={(
                    <QuickActionButton
                        title="Remove"
                        name={undefined}
                        onClick={handleClick}
                    >
                        <IoClose />
                    </QuickActionButton>
                )}
            >
                {displayValue}
            </ElementFragments>
        </div>
    );
}

export default StakeholderRow;
