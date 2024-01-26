import React from 'react';
import { isDefined, _cs } from '@togglecorp/fujs';
import {
    ElementFragments,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    IoDocumentOutline,
    IoEyeOutline,
    IoTrashOutline,
} from 'react-icons/io5';

import { PartialAdditonalDocument } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import styles from './styles.css';

interface Props {
    className?: string;
    data: PartialAdditonalDocument;
    onRemoveFile?: (key: string) => void;
    onChangeSelectedDocument?: (key: string) => void;
}

function LinkUploadItem(props: Props) {
    const {
        className,
        data,
        onRemoveFile,
        onChangeSelectedDocument,
    } = props;

    return (
        <div className={_cs(className, styles.uploadItem)}>
            {isDefined(data.clientId) ? (
                <ElementFragments
                    icons={<IoDocumentOutline className={styles.icon} />}
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
                    {data.externalLink}
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

export default LinkUploadItem;
