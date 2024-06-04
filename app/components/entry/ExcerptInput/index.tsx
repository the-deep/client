import React from 'react';
import { BsDownload } from 'react-icons/bs';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    ImagePreview,
    Message,
    QuickActionLink,
} from '@the-deep/deep-ui';
import { genericMemo } from '#utils/common';

import { EntryType } from '#generated/types';
import ExcerptTextArea from '#components/entry/ExcerptTextArea';
import _ts from '#ts';

import styles from './styles.css';

type Props<N extends string> = {
    className?: string;
    imageClassName?: string;
    excerptForImageClassName?: string;
    entryType: EntryType['entryType'];
    value: string | undefined | null;
    // droppedExcerpt: EntryType['droppedExcerpt'] | undefined;

    image: EntryType['image'] | undefined; // image from server (screenshot)
    imageRaw: string | undefined; // temporary image
    entryAttachment?: EntryType['entryAttachment'] | undefined; // copy of lead attachment that also has image from server
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
        // droppedValue,
        // tabularFieldData,
        imageClassName,
        excerptForImageClassName,
        entryType,
        image,
        imageRaw,
        value,
        entryAttachment,
    } = props;

    if (entryType === 'IMAGE') {
        const imageSrc = imageRaw ?? image?.file?.url;
        return (
            <div className={_cs(className, styles.excerptInput, styles.imageExcerptContainer)}>
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
            </div>
        );
    }
    if (entryType === 'ATTACHMENT') {
        const attachmentSrc = imageRaw ?? entryAttachment?.filePreview?.url;
        return (
            <Container
                className={_cs(className, styles.excerptInput, styles.imageExcerptContainer)}
                headerActions={entryAttachment?.entryFileType === 'XLSX' ? (
                    <QuickActionLink
                        title="Open external"
                        to={entryAttachment?.file?.url || ''}
                    >
                        <BsDownload />
                    </QuickActionLink>
                ) : undefined}
            >
                {attachmentSrc ? (
                    <ImagePreview
                        className={_cs(imageClassName, styles.image)}
                        alt=""
                        src={attachmentSrc}
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
