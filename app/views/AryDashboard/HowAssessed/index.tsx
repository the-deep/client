import React from 'react';
import { _cs } from '@togglecorp/fujs';

interface Props {
    className?: string;
}

function HowAssessed(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className)}>
            How was it assessed?
        </div>
    );
}
export default HowAssessed;
