import React from 'react';
import { isDefined, isNotDefined, _cs } from '@togglecorp/fujs';
import {
    ElementFragments,
    QuickActionButton,
    Spinner,
} from '@the-deep/deep-ui';
import {
    IoDocumentOutline,
    IoEyeOutline,
    IoTrashOutline,
} from 'react-icons/io5';

import { useRequest } from '#base/utils/restRequest';
import { PartialAdditonalDocument } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import { FileUploadResponse } from '../../types';
import styles from './styles.css';

interface Props {
    className?: string;
    data?: PartialAdditonalDocument;
    onRemoveFile?: (key: string) => void;
    onChangeSelectedDocument?: (key: string) => void;
}

function UploadItem(props: Props) {
    const {
        className,
        data,
        onRemoveFile,
        onChangeSelectedDocument,
    } = props;

    const {
        pending,
        response,
    } = useRequest<FileUploadResponse>({
        skip: isNotDefined(data?.file),
        url: `server://files/${data?.file}`,
    });

    const attachmentTitle = isDefined(data?.file) ? response?.title : data?.externalLink;

    return (
        <div className={_cs(className, styles.uploadItem)}>
            {isDefined(data) ? (
                <ElementFragments
                    icons={pending
                        ? <Spinner />
                        : <IoDocumentOutline className={styles.icon} />}
                    iconsContainerClassName={styles.icons}
                    actions={(
                        <QuickActionButton
                            name={data.clientId}
                            onClick={onRemoveFile}
                            title="delete"
                        >
                            <IoTrashOutline />
                        </QuickActionButton>
                    )}
                    actionsContainerClassName={styles.actions}
                    childrenContainerClassName={styles.content}
                >
                    {attachmentTitle}
                    <QuickActionButton
                        name={data.clientId}
                        onClick={onChangeSelectedDocument}
                        title="preview"
                    >
                        <IoEyeOutline />
                    </QuickActionButton>

                </ElementFragments>
            ) : null}
        </div>
    );
}

export default UploadItem;
