import React from 'react';

import {
    Button,
} from '@the-deep/deep-ui';

interface Props {
    title: string;
    itemKey: string;
    disabled?: boolean;
    value: boolean;
    onTagClick: (key: string) => void;
}

function CheckButton(props: Props) {
    const {
        title,
        itemKey,
        disabled,
        value,
        onTagClick,
    } = props;

    return (
        <Button
            name={itemKey}
            disabled={disabled}
            variant={value ? 'primary' : 'secondary'}
            onClick={onTagClick}
        >
            {title}
        </Button>
    );
}

export default CheckButton;
