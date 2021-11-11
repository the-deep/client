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

    return (
        <>
            {value && (
                <IoGitMergeSharp
                    className={className}
                />
            )}
            {!value && (
                <IoGitMergeSharp
                    className={className}
                />
            )}
        </>
    );
}

export default SubRegionCheckmark;
