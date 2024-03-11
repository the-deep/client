import React from 'react';

import {
    type MapConfigType,
} from '../../../../schema';

interface Props {
    className?: string;
    configuration?: MapConfigType;
}

function MapContent(props: Props) {
    const {
        className,
        configuration,
    } = props;

    // eslint-disable-next-line no-console
    console.log('here', configuration);

    return (
        <div className={className}>
            Map Content
        </div>
    );
}

export default MapContent;
