import React from 'react';
import PropTypes from 'prop-types';

import { isFalsy } from '@togglecorp/fujs';

import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import DateInput from '#rsci/DateInput';
import NumberInput from '#rsci/NumberInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { xmlConnectorTypes } from '../connector-utils';

import styles from './styles.scss';

const propTypes = {
    field: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    connectorSourceKey: PropTypes.string.isRequired,
    xmlFieldOptions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pendingXmlFieldOptions: PropTypes.bool,
};

const defaultProps = {
    xmlFieldOptions: undefined,
    pendingXmlFieldOptions: false,
};

export default class ConnectorFormFieldInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            field: data,
            connectorSourceKey,
            xmlFieldOptions,
            pendingXmlFieldOptions,
        } = this.props;

        switch (data.fieldType) {
            case 'string':
            case 'url':
                if (data.key === 'feed-url') {
                    return (
                        <div className={styles.feedUrlContainer}>
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
                            key={data.key}
                            faramElementName={data.key}
                            label={data.title}
                            options={xmlFieldOptions}
                            disabled={pendingXmlFieldOptions}
                        />
                    );
                }
                return (
                    <SelectInput
                        key={data.key}
                        faramElementName={data.key}
                        label={data.title}
                        options={data.options}
                    />
                );
            case 'date':
                return (
                    <DateInput
                        key={data.key}
                        faramElementName={data.key}
                        label={data.title}
                    />
                );
            case 'number':
                return (
                    <NumberInput
                        key={data.key}
                        faramElementName={data.key}
                        label={data.title}
                    />
                );
            default:
                return null;
        }
    }
}
