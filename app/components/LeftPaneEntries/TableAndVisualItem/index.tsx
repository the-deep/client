import React, { useCallback } from 'react';
import { BsDownload } from 'react-icons/bs';
import {
    IoAdd,
} from 'react-icons/io5';
import {
    isDefined,
} from '@togglecorp/fujs';
import {
    Container,
    QuickActionButton,
    QuickActionLink,
    ImagePreview,
} from '@the-deep/deep-ui';
import {
    LeadPreviewAttachmentType,
} from '#generated/types';

import EntryItem, { EntryItemProps } from '../EntryItem';

interface EntryProps extends EntryItemProps {
    type: 'entry-item'
}
interface VisualProps {
    type: 'visual-item'

    attachment: LeadPreviewAttachmentType;
    onClick?: (attachment: LeadPreviewAttachmentType) => void;

    disableClick: boolean | undefined;
}

export type Props = EntryProps | VisualProps;

function TableAndVisualItem(props: Props) {
    const handleEntryAddFromAttachment = useCallback(() => {
        // eslint-disable-next-line react/destructuring-assignment
        if (props.type === 'entry-item') {
            return;
        }
        // eslint-disable-next-line react/destructuring-assignment
        if (props.onClick) {
        // eslint-disable-next-line react/destructuring-assignment
            props.onClick(props.attachment);
        }
    }, [
        props,
    ]);

    // eslint-disable-next-line react/destructuring-assignment
    if (props.type === 'entry-item') {
        return (
            <EntryItem
                {...props}
            />
        );
    }

    const {
        attachment,
        disableClick,
    } = props;

    return (
        <Container
            headerActions={(
                <>
                    <QuickActionButton
                        name={undefined}
                        title="Add Entry"
                        onClick={handleEntryAddFromAttachment}
                        disabled={disableClick}
                    >
                        <IoAdd />
                    </QuickActionButton>
                    {attachment.type === 'XLSX' && isDefined(attachment.file.url) && (
                        <QuickActionLink
                            title="Open external"
                            to={attachment.file.url}
                        >
                            <BsDownload />
                        </QuickActionLink>
                    )}
                </>
            )}
            spacing="compact"
        >
            <ImagePreview
                alt="Preview Image"
                src={attachment.filePreview?.url ?? undefined}
            />
        </Container>
    );
}

export default TableAndVisualItem;
