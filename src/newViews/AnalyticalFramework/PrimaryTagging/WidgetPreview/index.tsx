import React from 'react';
import {
    TextArea,
} from '@the-deep/deep-ui';

import { Widget, PartialForm } from '../types';

type PartialWidget = PartialForm<
    Widget,
    'clientId' | 'type'
>;

interface Props {
    widget: PartialWidget,
}
function WidgetPreview(props: Props) {
    const {
        widget,
    } = props;

    if (widget.type === 'text') {
        return (
            <div>
                <TextArea
                    name={widget.clientId}
                    rows={5}
                    value=""
                    label={widget.title ?? 'Unnnamed'}
                    readOnly
                />
            </div>
        );
    }
    return null;
}

export default WidgetPreview;
