import React from 'react';
import { BsDownload } from 'react-icons/bs';
import {
    IoAdd,
} from 'react-icons/io5';

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
        onClick,
        disableClick,
    } = props;

    return (
        <Container
            headerActions={(
                <>
                    <QuickActionButton
                        // FIXME:
                        name={undefined}
                        title="Add Entry"
                        onClick={() => {
                            if (onClick) {
                                onClick(attachment);
                            }
                        }}
                        disabled={disableClick}
                    >
                        <IoAdd />
                    </QuickActionButton>
                    {attachment.type === 'XLSX' && (
                        <QuickActionLink
                            title="Open external"
                            to={attachment.file?.url || ''}
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
                src={attachment.filePreview?.url ?? ''}
            />
        </Container>
    );
}

export default TableAndVisualItem;
