import React, { useEffect } from 'react';

import { _cs, randomString, formatDateToString } from '@togglecorp/fujs';
import { useLazyRequest } from '#utils/request';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import { IoTrashOutline } from 'react-icons/io5';
import { Lead } from '#typings';

import { FileUploadResponse } from '../../types';
import styles from './styles.scss';


interface Props {
    className?: string;
    data: FileUploadResponse;
    activeUserId: number;
    activeProjectId: number;
}

function SourceItem(props: Props) {
    const {
        className,
        data,
        activeProjectId,
        activeUserId,
    } = props;

    const {
        pending,
        trigger,
    } = useLazyRequest<Lead, unknown>({
        url: 'server://v2/leads/',
        method: 'POST',
        body: {
            id: randomString(),
            title: data.title,
            project: activeProjectId,
            assignee: activeUserId,
            publishedOn: formatDateToString(new Date(), 'yyyy-MM-dd'),
            confidentiality: 'unprotected',
            priority: 100,
            attachment: {
                id: data.id,
                file: data.file,
                mimeType: data.mimeType,
                title: data.title,
            },
        },
        onSuccess: (response) => {
            console.warn('resposne', response); // FIXME  handle this later
        },
    });

    useEffect(() => {
        trigger(null);
    }, [trigger]);

    const handleDeleteClick = () => {
        console.warn('delete'); // FIXME handle this later
    };

    return (
        <div className={_cs(className, styles.item)}>
            <ElementFragments
                actions={(
                    <QuickActionButton
                        name="retrigger"
                        onClick={handleDeleteClick}
                        disabled={pending}
                    >
                        <IoTrashOutline />
                    </QuickActionButton>
                )}
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.content}
            >
                {data.title}
            </ElementFragments>
        </div>
    );
}

export default SourceItem;
