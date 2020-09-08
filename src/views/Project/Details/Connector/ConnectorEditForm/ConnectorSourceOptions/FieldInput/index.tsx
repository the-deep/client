import React from 'react';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';

import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import DateInput from '#rsci/DateInput';
import NumberInput from '#rsci/NumberInput';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    KeyValueElement,

    ConnectorSource,
    ConnectorSourceOption,
} from '#typings';

import styles from './styles.scss';

const xmlConnectorTypes = [
    'rss-feed',
    'atom-feed',
    'emm',
];

interface ComponentProps {
    className?: string;
    field: ConnectorSourceOption;
    connectorSourceKey: ConnectorSource['key'];
    disabled?: boolean;
    xmlFieldOptions?: KeyValueElement[];
    pendingXmlFieldOptions?: boolean;
}

function ConnectorFormFieldInput(props: ComponentProps) {
    const {
        className,
        field: data,
        connectorSourceKey,
        xmlFieldOptions,
        pendingXmlFieldOptions,
        disabled,
    } = props;

    switch (data.fieldType) {
        case 'string':
        case 'url':
            if (data.key === 'feed-url') {
                return (
                    <div className={_cs(styles.feedUrlContainer, className)}>
                        <TextInput
                            key={data.key}
                            className={styles.feedUrl}
                            faramElementName={data.key}
                            label={data.title}
                        />
                        { pendingXmlFieldOptions &&
                            <div className={styles.loadingAnimationContainer} >
                                <LoadingAnimation className={styles.loadingAnimation} />
                            </div>
                        }
                    </div>
                );
            }
            return (
                <TextInput
                    className={className}
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        case 'select':
            if (xmlConnectorTypes.includes(connectorSourceKey)) {
                if (isFalsy(xmlFieldOptions)) {
                    return null;
                }
                return (
                    <SelectInput
                        className={className}
                        key={data.key}
                        faramElementName={data.key}
                        label={data.title}
                        options={xmlFieldOptions}
                        disabled={pendingXmlFieldOptions || disabled}
                    />
                );
            }
            return (
                <SelectInput
                    className={className}
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                    options={data.options}
                />
            );
        case 'date':
            return (
                <DateInput
                    className={className}
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        case 'number':
            return (
                <NumberInput
                    className={className}
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                    separator=" "
                />
            );
        default:
            return null;
    }
}

export default ConnectorFormFieldInput;
