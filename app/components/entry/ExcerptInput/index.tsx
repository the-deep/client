import React from 'react';
import { BsDownload } from 'react-icons/bs';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Container,
    ImagePreview,
    Message,
    QuickActionLink,
} from '@the-deep/deep-ui';
import { genericMemo } from '#utils/common';

import { EntryType, LeadPreviewAttachmentType } from '#generated/types';
import ExcerptTextArea from '#components/entry/ExcerptTextArea';
import _ts from '#ts';

import styles from './styles.css';

type Props<N extends string> = {
    className?: string;
    imageClassName?: string;
    excerptForImageClassName?: string;
    entryType: EntryType['entryType'];
    value: string | undefined | null;

    // temporary image (eg. image from unsaved screenshot or image from lead attachment)
    imageRaw: string | undefined;

    image: EntryType['image'] | undefined;
    entryAttachment: EntryType['entryAttachment'] | undefined;

    // For select few cases, we might need to override entryAttachment with leadAttachment
    leadAttachment?: LeadPreviewAttachmentType;
} & ({
    name: N;
    onChange: (newVal: string | undefined, name: N) => void;
    readOnly?: false;
} | {
    readOnly: true;
})

function ExcerptInput<N extends string>(props: Props<N>) {
    const {
        className,
        imageClassName,
        excerptForImageClassName,
        entryType,
        image,
        imageRaw,
        value,
        entryAttachment,
        leadAttachment,
    } = props;

    // Manually added images (e.g. using screenshot)
    if (entryType === 'IMAGE') {
        const imageSrc = imageRaw ?? image?.file?.url;
        return (
            <Container
                className={_cs(className, styles.excerptInput, styles.imageExcerptContainer)}
            >
                {imageSrc ? (
                    <ImagePreview
                        className={_cs(imageClassName, styles.image)}
                        alt=""
                        src={imageSrc}
                    />
                ) : (
                    <Message
                        className={_cs(excerptForImageClassName, styles.image)}
                        message="Image data is not available."
                    />
                )}
                {!props.readOnly && ( // eslint-disable-line react/destructuring-assignment
                    <ExcerptTextArea
                        label="Additional Context"
                        className={_cs(
                            excerptForImageClassName,
                            styles.textAreaForImage,
                        )}
                        value={value}
                        // eslint-disable-next-line react/destructuring-assignment
                        name={props.name}
                        // eslint-disable-next-line react/destructuring-assignment
                        onChange={props.onChange}
                        autoSize
                    />
                )}
                {props.readOnly && value && ( // eslint-disable-line react/destructuring-assignment
                    <div className={excerptForImageClassName}>
                        {value}
                    </div>
                )}
            </Container>
        );
    }
    // Manually added images (e.g. using screenshot)
    if (entryType === 'ATTACHMENT') {
        const filePreview = leadAttachment
            ? leadAttachment.filePreview
            : entryAttachment?.filePreview;

        const fileType = leadAttachment
            ? leadAttachment.type
            : entryAttachment?.entryFileType;

        const file = leadAttachment
            ? leadAttachment.file
            : entryAttachment?.file;

        const attachmentSrc = imageRaw ?? filePreview?.url;
        return (
            <Container
                className={_cs(className, styles.excerptInput, styles.imageExcerptContainer)}
                headerActions={fileType === 'XLSX' && isDefined(file) && isDefined(file.url) && (
                    <QuickActionLink
                        title="Open external"
                        to={file.url}
                    >
                        <BsDownload />
                    </QuickActionLink>
                )}
            >
                {attachmentSrc ? (
                    <ImagePreview
                        className={_cs(imageClassName, styles.image)}
                        alt=""
                        src={attachmentSrc}
                        disableZoomOnScroll
                    />
                ) : (
                    <Message
                        className={_cs(excerptForImageClassName, styles.image)}
                        message="Image data is not available."
                    />
                )}
                {!props.readOnly && ( // eslint-disable-line react/destructuring-assignment
                    <ExcerptTextArea
                        label="Additional Context"
                        className={_cs(
                            excerptForImageClassName,
                            styles.textAreaForImage,
                        )}
                        value={value}
                        // eslint-disable-next-line react/destructuring-assignment
                        name={props.name}
                        // eslint-disable-next-line react/destructuring-assignment
                        onChange={props.onChange}
                        autoSize
                    />
                )}
                {props.readOnly && value && ( // eslint-disable-line react/destructuring-assignment
                    <div className={excerptForImageClassName}>
                        {value}
                    </div>
                )}
            </Container>
        );
    }
    if (entryType === 'EXCERPT') {
        // eslint-disable-next-line react/destructuring-assignment
        return props.readOnly ? (
            <div className={_cs(className, styles.excerptInput)}>
                {value || (
                    <div className={styles.emptyExcerpt}>
                        There is no excerpt.
                    </div>
                )}
            </div>
        ) : (
            <div className={_cs(className, styles.excerptInput)}>
                <ExcerptTextArea
                    className={_cs(className, styles.textArea)}
                    value={value}
                    // eslint-disable-next-line react/destructuring-assignment
                    onChange={props.onChange}
                    // eslint-disable-next-line react/destructuring-assignment
                    name={props.name}
                    autoSize
                />
            </div>
        );
    }
    if (entryType === 'DATA_SERIES') {
        return (
            <div className={className}>
                {_ts('components.excerptOutput', 'quantitativeDataNotSupportedLabel')}
            </div>
        );
    }
    return null;
}

export default genericMemo(ExcerptInput);
