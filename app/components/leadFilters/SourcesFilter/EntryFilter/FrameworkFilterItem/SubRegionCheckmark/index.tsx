import React from 'react';
import {
    IoGitMergeSharp,
} from 'react-icons/io5';

export interface SubRegionCheckmarkProps {
    className?: string;
    value: boolean | undefined | null;
}

function SubRegionCheckmark(props: SubRegionCheckmarkProps) {
    const {
        className,
        value,
    } = props;

    if (value) {
        return (
            <IoGitMergeSharp
                className={className}
            />
        );
    }
    return (
        <IoGitMergeSharp
            className={className}
        />
    );
}

export default SubRegionCheckmark;
