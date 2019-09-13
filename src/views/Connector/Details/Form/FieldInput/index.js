import React from 'react';
import PropTypes from 'prop-types';

import { isFalsy } from '@togglecorp/fujs';

import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import DateInput from '#rsci/DateInput';
import NumberInput from '#rsci/NumberInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { xmlConnectorTypes } from '../requests';

import styles from './styles.scss';

const propTypes = {
    field: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    connectorSourceKey: PropTypes.string.isRequired,
    rssOptions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pendingRssFields: PropTypes.bool,
};

const defaultProps = {
    rssOptions: undefined,
    pendingRssFields: false,
};

export default class ConnectorFormFieldInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            field: data,
            connectorSourceKey,
            rssOptions,
            pendingRssFields,
        } = this.props;

        if (data.fieldType === 'string' || data.fieldType === 'url') {
            if (data.key === 'feed-url') {
                return (
                    <div className={styles.feedUrlContainer}>
                        <TextInput
                            key={data.key}
                            className={styles.feedUrl}
                            faramElementName={data.key}
                            label={data.title}
                        />
                        { pendingRssFields &&
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
        } else if (data.fieldType === 'select') {
            if (xmlConnectorTypes.includes(connectorSourceKey)) {
                if (isFalsy(rssOptions)) {
                    return null;
                }
                return (
                    <SelectInput
                        key={data.key}
                        faramElementName={data.key}
                        label={data.title}
                        options={rssOptions}
                        disabled={pendingRssFields}
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
        } else if (data.fieldType === 'date') {
            return (
                <DateInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        } else if (data.fieldType === 'number') {
            return (
                <NumberInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        }
        return null;
    }
}

