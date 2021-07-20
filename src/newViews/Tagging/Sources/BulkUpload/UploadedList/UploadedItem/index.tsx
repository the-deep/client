import React from 'react';

interface Props {
    name: string;
    isUploaded: boolean;
}

function UploadedItem(props: Props) {
    return (
        <div>{props.name}{props.isUploaded ? 'uploaded' : 'processing'}</div>
    );
}

export default UploadedItem;
