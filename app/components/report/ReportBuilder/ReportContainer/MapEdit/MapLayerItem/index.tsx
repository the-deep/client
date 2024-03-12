import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoEyeOutline,
    IoEyeOffOutline,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';

import {
    Element,
    Button,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { Attributes, Listeners } from '#components/SortableList';

import styles from './styles.css';

interface Props {
    clientId: string;
    title: string;
    onClick: (newLayerId: string) => void;
    visibility: boolean;
    onVisibilityClick: () => void;
    attributes?: Attributes;
    listeners?: Listeners;
    selected: boolean;
    index: number;
}

function MapLayerItem(props: Props) {
    const {
        clientId,
        title,
        onClick,
        visibility,
        onVisibilityClick,
        selected,
        attributes,
        listeners,
        index,
    } = props;

    return (
        <Element
            className={_cs(selected && styles.selected, styles.layer)}
            icons={(
                <QuickActionButton
                    name={index}
                    // FIXME: use translation
                    title="Drag"
                    {...attributes}
                    {...listeners}
                >
                    <GrDrag />
                </QuickActionButton>
            )}
            actions={(
                <QuickActionButton
                    name="visible"
                    onClick={onVisibilityClick}
                >
                    {visibility
                        ? <IoEyeOutline />
                        : <IoEyeOffOutline />}
                </QuickActionButton>
            )}
            spacing="compact"
        >
            <Button
                name={clientId}
                variant="transparent"
                onClick={onClick}
                className={styles.button}
            >
                {title}
            </Button>
        </Element>
    );
}

export default MapLayerItem;
