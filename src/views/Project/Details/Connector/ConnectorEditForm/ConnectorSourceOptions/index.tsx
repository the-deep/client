import React, { useCallback, useEffect } from 'react';
import {
    _cs,
    isValidUrl,
} from '@togglecorp/fujs';
import { FaramGroup } from '@togglecorp/faram';

import ListView from '#rscv/List/ListView';
import {
    KeyValueElement,
    ConnectorSource,
    ConnectorSourceOption,
    ConnectorSourceFaramInstance,
} from '#typings';

import useRequest from '#restrequest';

import FieldInput from './FieldInput';
import { xmlConnectorTypes } from '../../utils';

import styles from './styles.scss';

interface XmlFieldOptionsResponse {
    count: number;
    hasEmmEntities: boolean;
    hasEmmTriggers: boolean;
    results: KeyValueElement[];
}

interface ComponentProps {
    className?: string;
    title: ConnectorSource['title'];
    sourceKey: ConnectorSource['key'];
    options: ConnectorSource['options'];
    disabled?: boolean;
    index: number;
    connectorSourceValues?: ConnectorSourceFaramInstance;
}

const sourceOptionKeySelector = (d: ConnectorSourceOption) => d.key;

function ConnectorSourceOptions(props: ComponentProps) {
    const {
        className,
        sourceKey,
        index,
        title,
        options,
        disabled,
        connectorSourceValues,
    } = props;

    const feedUrl = String(connectorSourceValues?.params?.['feed-url'] ?? '');

    const [
        pendingXmlOptions,
        xmlFieldOptions,
        ,
        triggerXmlOptionsFetch,
    ] = useRequest<XmlFieldOptionsResponse>({
        url: `server://connector-sources/${sourceKey}/fields/`,
        method: 'GET',
        query: ({ 'feed-url': feedUrl }),
    });

    useEffect(() => {
        if (xmlConnectorTypes.indexOf(sourceKey) !== -1 && isValidUrl(feedUrl)) {
            triggerXmlOptionsFetch();
        }
    }, [feedUrl, triggerXmlOptionsFetch, sourceKey]);

    const sourceOptionRendererParams = useCallback((key, data) => ({
        className: styles.inputElement,
        field: data,
        connectorSourceKey: sourceKey,
        disabled,
        pendingXmlOptions,
        xmlFieldOptions: xmlFieldOptions?.results,
    }), [
        sourceKey,
        disabled,
        pendingXmlOptions,
        xmlFieldOptions,
    ]);

    return (
        <div className={_cs(styles.connectorSourceOptions, className)}>
            <FaramGroup faramElementName={String(index)}>
                <header className={styles.header}>
                    <h3>{title}</h3>
                </header>
                <FaramGroup faramElementName="params">
                    <ListView
                        className={styles.fieldsContainer}
                        data={options}
                        renderer={FieldInput}
                        rendererParams={sourceOptionRendererParams}
                        keySelector={sourceOptionKeySelector}
                    />
                </FaramGroup>
            </FaramGroup>
        </div>
    );
}

export default ConnectorSourceOptions;
