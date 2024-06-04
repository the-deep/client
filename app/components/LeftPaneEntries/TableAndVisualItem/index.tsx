import React, { useMemo } from 'react';
import { BsDownload } from 'react-icons/bs';
import {
    IoCheckmark,
    IoClose,
} from 'react-icons/io5';

import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Container,
    QuickActionButton,
    useInputState,
    Button,
    QuickActionButtonProps,
    QuickActionLink,
    NumberOutput,
    Tag,
} from '@the-deep/deep-ui';
import { requiredStringCondition } from '@togglecorp/toggle-form';

import ExcerptTextArea from '#components/entry/ExcerptTextArea';
import ExcerptInput from '#components/entry/ExcerptInput';
import {
    EntryTagTypeEnum,
    LeadPreviewAttachmentType,
} from '#generated/types';

import styles from './styles.css';

interface ExcerptModalProps {
    title: string;
    excerpt?: string;
    onComplete?: (modifiedExcerpt: string | undefined) => void;
}

export function ExcerptModal(props: ExcerptModalProps) {
    const {
        title,
        excerpt: excerptFromProps,
        onComplete,
    } = props;

    const [excerpt, setExcerpt] = useInputState(excerptFromProps);

    const handleSubmit = React.useCallback(
        () => {
            if (onComplete) {
                onComplete(excerpt);
            }
        },
        [onComplete, excerpt],
    );

    return (
        <Container
            className={styles.excerptModalContainer}
            heading={title}
            spacing="compact"
            footerActions={(
                <Button
                    name={excerpt}
                    onClick={handleSubmit}
                    disabled={requiredStringCondition(excerpt) !== undefined}
                >
                    Done
                </Button>
            )}
        >
            <ExcerptTextArea
                className={styles.excerptTextArea}
                name="modified-excerpt"
                value={excerpt}
                onChange={setExcerpt}
                rows={10}
            />
        </Container>
    );
}

interface TableAndVisualItemProps {
    attachmentId: string;
    onClick?: (dataId: LeadPreviewAttachmentType['id']) => void;
    onApproveButtonClick?: QuickActionButtonProps<string>['onClick'];
    onDiscardButtonClick?: QuickActionButtonProps<string>['onClick'];
    className?: string;
    disableApproveButton?: boolean;
    disableDiscardButton?: boolean;
    disableClick?: boolean;
    errored?: boolean;
    deleted?: boolean;
    stale?: boolean;
    data: LeadPreviewAttachmentType;
    isActive?: boolean;
    entryId: string | undefined;
}

function TableAndVisualItem(props: TableAndVisualItemProps) {
    const {
        className,
        attachmentId,
        onClick,
        onApproveButtonClick,
        onDiscardButtonClick,
        disableApproveButton,
        disableDiscardButton,
        disableClick,
        deleted,
        errored,
        stale,
        data,
        isActive,
        entryId,
    } = props;

    const entryTypeFromLead = useMemo((): EntryTagTypeEnum | undefined => {
        if (data?.type === 'IMAGE' || data?.type === 'XLSX') {
            return 'IMAGE';
        }
        return undefined;
    }, [data]);

    const handleClick = React.useCallback(() => {
        if (onClick && !disableClick) {
            onClick(attachmentId);
        }
    }, [attachmentId, onClick, disableClick]);

    if (isNotDefined(entryId)) {
        return (
            <div
                className={styles.clickableArea}
                onClick={handleClick}
                role="presentation"
            >
                <Container
                    headerActions={data?.type === 'XLSX' ? (
                        <QuickActionLink
                            title="Open external"
                            to={data?.file?.url || ''}
                        >
                            <BsDownload />
                        </QuickActionLink>
                    ) : undefined}
                >
                    {isDefined(entryTypeFromLead) && (
                        <ExcerptInput
                            value={data?.type}
                            entryType={entryTypeFromLead}
                            image={undefined}
                            entryAttachment={undefined}
                            imageRaw={data?.filePreview?.url ?? ''}
                            readOnly
                        />
                    )}
                </Container>
            </div>
        );
    }

    return (
        <div>
            <Container
                className={_cs(
                    styles.taggedExcerpt,
                    className,
                    entryId && isActive && styles.active,
                )}
                headerActions={data?.type === 'XLSX' ? (
                    <QuickActionLink
                        title="Open external"
                        to={data?.file?.url || ''}
                    >
                        <BsDownload />
                    </QuickActionLink>
                ) : undefined}
                heading={isNotDefined(attachmentId) ? (
                    <NumberOutput
                        className={styles.entryId}
                        prefix="#"
                        value={Number(attachmentId)}
                    />
                ) : (
                    <span className={styles.unsavedEntry}>(unsaved entry)</span>
                )}
                headingClassName={styles.heading}
                headingSize="extraSmall"
                headingSectionClassName={styles.headingSection}
                footerIcons={(
                    <>
                        {stale && !deleted && !errored && (
                            <Tag
                                spacing="compact"
                            >
                                Changed
                            </Tag>
                        )}
                        {deleted && (
                            <Tag
                                variant="complement2"
                                spacing="compact"
                            >
                                Deleted
                            </Tag>
                        )}
                        {errored && (
                            <Tag
                                spacing="compact"
                            >
                                Error
                            </Tag>
                        )}
                    </>
                )}
                footerQuickActions={isActive && (
                    <>
                        <QuickActionButton
                            title="Discard changes"
                            name={attachmentId}
                            onClick={onDiscardButtonClick}
                            disabled={disableDiscardButton}
                        >
                            <IoClose />
                        </QuickActionButton>
                        <QuickActionButton
                            title="Approve changes"
                            name={attachmentId}
                            onClick={onApproveButtonClick}
                            variant="primary"
                            disabled={disableApproveButton}
                        >
                            <IoCheckmark />
                        </QuickActionButton>
                    </>
                )}
                contentClassName={styles.content}
            >
                {isDefined(entryTypeFromLead) && (
                    <ExcerptInput
                        value={data?.type}
                        entryType={entryTypeFromLead}
                        imageRaw={data?.filePreview?.url ?? ''}
                        image={undefined}
                        entryAttachment={undefined}
                        readOnly
                    />
                )}
                <div className={styles.verticalBorder} />
            </Container>
        </div>
    );
}

export default TableAndVisualItem;
