import React from 'react';
import { SearchSelectInput } from '@the-deep/deep-ui';
import { noOp } from '@togglecorp/fujs';

interface Props {
    data?: [];
}

function IssuesInput(props: Props) {
    const {
        data,
    } = props;

    return (
        <div>
            <SearchSelectInput
                placeholder="1. Field Name"
                keySelector={(d) => d.id}
                labelSelector={(d) => d.name}
                onChange={noOp}
                options={[
                    {
                        id: 1,
                        name: 'test',
                    },
                ]}
            />
        </div>
    );
}

export default IssuesInput;
