import React from 'react';

interface Props {
    name: string;
}

function UploadedItem(props: Props) {
    return (
        <div>{props.name}</div>
    );
}

export default UploadedItem;
