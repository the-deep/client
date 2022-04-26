import React, { useCallback } from 'react';
import {
    DateOutput,
    Checkbox,
    RawButton,
    Tag,
} from '@the-deep/deep-ui';
import {
    _cs,
} from '@togglecorp/fujs';

import styles from './styles.css';

interface ConnectorSourceLeadItemProps<N> {
    onClick: (value: N) => void;
    onCheckClicked: (value: N) => void;
    name: N;

    selected: boolean;
    className?: string;

    title: string | undefined | null;
    publishedOn: string | undefined | null;

    errored: boolean;
    checked: boolean;
    faded: boolean;
    disabled: boolean,
}
function ConnectorSourceLeadItem<N>(props: ConnectorSourceLeadItemProps<N>) {
    const {
        className,
        onClick,
        name,
        selected,
        checked,
        onCheckClicked,
        errored,
        title,
        publishedOn,
        faded,
        disabled,
    } = props;

    const handleClick = useCallback(
        () => {
            onClick(name);
        },
        [name, onClick],
    );

    const handleCheckboxClick = useCallback(
        () => {
            onCheckClicked(name);
        },
        [name, onCheckClicked],
    );

    return (
        <div
            title={title || 'Unnamed'}
            className={_cs(
                className,
                styles.connectorLeadItemContainer,
                selected && styles.selected,
                faded && styles.faded,
            )}
        >
            <Checkbox
                name={undefined}
                onChange={handleCheckboxClick}
                value={checked}
                disabled={disabled}
            />
            <RawButton
                className={styles.title}
                name={undefined}
                onClick={handleClick}
                disabled={disabled}
            >
                {title || 'Unnamed'}
            </RawButton>
            {errored && (
                <Tag
                    className={styles.tag}
                >
                    Errored
                </Tag>
            )}
            <DateOutput
                className={styles.date}
                value={publishedOn}
            />
        </div>
    );
}
export default ConnectorSourceLeadItem;
