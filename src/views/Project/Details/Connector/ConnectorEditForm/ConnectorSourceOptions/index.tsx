import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramGroup } from '@togglecorp/faram';

import ListView from '#rscv/List/ListView';
import {
    ConnectorSource,
    ConnectorSourceOption,
} from '#typings';

import FieldInput from './FieldInput';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    title: ConnectorSource['title'];
    sourceKey: ConnectorSource['key'];
    options: ConnectorSource['options'];
    disabled?: boolean;
    index: number;
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
    } = props;

    const sourceOptionRendererParams = useCallback((key, data) => ({
        className: styles.inputElement,
        field: data,
        connectorSourceKey: sourceKey,
        disabled,
    }), [sourceKey, disabled]);

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
