import React from 'react';
import { removeNull } from '@togglecorp/toggle-form';
import {
    Heading,
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import {
    AnalysisReportContainerContentTypeEnum,
    AnalysisReportContainerContentConfigurationType,
} from '#generated/types';

const variantToSizeMapping = {
    H1: 'extraLarge',
    H2: 'large',
    H3: 'medium',
    H4: 'small',
} as const;

interface Props {
    contentType: AnalysisReportContainerContentTypeEnum;
    configuration: AnalysisReportContainerContentConfigurationType | undefined;
}

function Content(props: Props) {
    const {
        contentType,
        configuration: configurationFromProps = {},
    } = props;

    const configuration = removeNull(configurationFromProps);

    if (contentType === 'HEADING') {
        const {
            heading: {
                content,
                variant,
            } = {},
        } = configuration;
        return (
            <Heading
                size={variant ? variantToSizeMapping[variant] : 'extraLarge'}
            >
                {content ?? 'Title goes here'}
            </Heading>
        );
    }

    return (
        <Message
            message="This type of content has not been configured yet."
            icon={(
                <Kraken
                    variant="crutches"
                    size="extraSmall"
                />
            )}
        />
    );
}

export default Content;
