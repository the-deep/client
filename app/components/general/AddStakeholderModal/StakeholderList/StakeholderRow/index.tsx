import React from 'react';
import { IoClose } from 'react-icons/io5';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';

export interface Props {
    className?: string;
    onRemove: (value: string) => void;
    value: string;
    displayValue?: string;
}

function StakeholderRow(props: Props) {
    const {
        className,
        onRemove,
        value,
        displayValue,
    } = props;

    return (
        <div className={className}>
            <ElementFragments
                actions={(
                    <QuickActionButton
                        title="Remove"
                        name={value}
                        onClick={onRemove}
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
