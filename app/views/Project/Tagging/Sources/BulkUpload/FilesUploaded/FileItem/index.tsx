import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
    Tag,
    Button,
    Element,
} from '@the-deep/deep-ui';
import { IoTrashOutline } from 'react-icons/io5';

import {
    PartialLeadType,
} from '../../schema';
import styles from './styles.css';

interface Props {
    className?: string;
    isSelected: boolean;
    isErrored: boolean;
    data: PartialLeadType;
    onSelect: (id: string) => void;
    onLeadRemove: (clientId: string) => void;
}

function FileItem(props: Props) {
    const {
        className,
        isSelected,
        isErrored,
        data,
        onLeadRemove,
        onSelect,
    } = props;

    return (
        <Element
            className={_cs(
                className,
                styles.itemContainer,
                isSelected && styles.selected,
            )}
            spacing="none"
            actionsContainerClassName={styles.actions}
            actions={(
                <>
                    {isErrored && (
                        <Tag>
                            Error
                        </Tag>
                    )}
                    <QuickActionButton
                        name={data.clientId}
                        title="Remove File"
                        onClick={onLeadRemove}
                    >
                        <IoTrashOutline />
                    </QuickActionButton>
                </>
            )}
        >
            <Button
                name={data.clientId}
                className={_cs(styles.item)}
                variant="action"
                onClick={onSelect}
            >
                {data.title}
            </Button>
        </Element>
    );
}

export default FileItem;
