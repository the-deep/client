import React from 'react';
import { FaBrain } from 'react-icons/fa';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    QuickActionDropdownMenu,
    QuickActionButton,
    Container,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';

import { PartialEntryType as EntryInput } from '../../schema';
import { Framework } from '../../types';
import AssistPopup from '../AssistPopup';

import styles from './styles.css';

interface Props {
    className?: string;
    textToAssist: string | undefined;
    onAssistedEntryAdd: ((newEntry: EntryInput) => void) | undefined;
    frameworkDetails: Framework;
    leadId: string;
    onAssistCancel: () => void;
}

function TextToAssistItem(props: Props) {
    const {
        className,
        textToAssist,
        onAssistedEntryAdd,
        frameworkDetails,
        leadId,
        onAssistCancel,
    } = props;

    if (!textToAssist) {
        return null;
    }

    return (
        <Container
            className={_cs(className, styles.textToAssistItem)}
            footerActions={(
                <QuickActionDropdownMenu
                    title="Assist"
                    className={styles.button}
                    variant="tertiary"
                    label={(<FaBrain />)}
                    persistent
                >
                    <AssistPopup
                        frameworkDetails={frameworkDetails}
                        leadId={leadId}
                        selectedText={textToAssist}
                        onEntryCreate={onAssistedEntryAdd}
                    />
                </QuickActionDropdownMenu>
            )}
            headerActions={(
                <QuickActionButton
                    name={undefined}
                    title="Cancel"
                    onClick={onAssistCancel}
                    variant="action"
                >
                    <IoClose />
                </QuickActionButton>
            )}
            contentClassName={styles.content}
        >
            {textToAssist}
        </Container>
    );
}

export default TextToAssistItem;
