import React, { useCallback, useState } from 'react';
import {
    Modal,
    Button,
    CheckListInput,
} from '@the-deep/deep-ui';
import { unified } from 'unified';
import markdown from 'remark-parse';
import docx from 'remark-docx';
import { saveAs } from 'file-saver';

import {
    PartialFormType,
} from '../schema';

const astProcessor = unified().use(markdown).use(docx, { output: 'blob' });

const keySelector = (item: NonNullable<PartialFormType['statements']>[number]) => item.clientId ?? '';
const labelSelector = (
    item: NonNullable<PartialFormType['statements']>[number],
) => ((item.statement?.length ?? 0) > 100 ? (`${item.statement?.slice(0, 100)}...`) : (item.statement ?? ''));

interface Props {
    value: PartialFormType | undefined;
    title: string | undefined;
    onClose: () => void;
}

function DocumentGeneratorModal(props: Props) {
    const {
        value,
        title,
        onClose,
    } = props;

    const [selectedStories, setSelectedStories] = useState<string[]>();

    const handleExport = useCallback(async () => {
        const statements = value
            ?.statements
            ?.filter((item) => selectedStories?.includes(item.clientId ?? ''))
            .map((item) => item.reportText)
            .join('\n');
        const doc = await astProcessor.process(statements);
        const blob = await doc.result as Blob;

        saveAs(blob, `${title ?? 'analysis'}.docx`);
        onClose();
    }, [
        title,
        onClose,
        value,
        selectedStories,
    ]);

    return (
        <Modal
            heading="Generate Docx"
            onCloseButtonClick={onClose}
            footerActions={(
                <Button
                    name={undefined}
                    disabled={(selectedStories?.length ?? 0) === 0}
                    onClick={handleExport}
                >
                    Generate
                </Button>
            )}
        >
            <CheckListInput
                label="Select analytical statement columns"
                name={undefined}
                value={selectedStories}
                options={value?.statements}
                keySelector={keySelector}
                labelSelector={labelSelector}
                direction="vertical"
                onChange={setSelectedStories}
            />
        </Modal>
    );
}

export default DocumentGeneratorModal;
