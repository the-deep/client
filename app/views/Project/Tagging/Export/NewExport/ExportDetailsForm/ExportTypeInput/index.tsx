import React, { useCallback, useState } from 'react';
import {
    List,
    Button,
    Modal,
} from '@the-deep/deep-ui';
import {
    AiFillFilePdf,
    AiFillFileExcel,
    AiFillFileWord,
    AiFillFileText,
} from 'react-icons/ai';

import _ts from '#ts';
import { useModalState } from '#hooks/stateManagement';
import {
    ExportFormatEnum,
} from '#generated/types';

import ExportTypeButton from './ExportTypeButton';
import AdvancedOptionsSelection from './AdvancedOptionsSelection';

interface ExportTypeItem {
    key: ExportFormatEnum;
    icon: React.ReactNode;
    title: string;
}

const exportTypes: ExportTypeItem[] = [
    {
        key: 'DOCX',
        icon: <AiFillFileWord title="Word export" />,
        title: _ts('export', 'docxLabel'),
    },
    {
        key: 'PDF',
        icon: <AiFillFilePdf title="PDF export" />,
        title: _ts('export', 'pdfLabel'),
    },
    {
        key: 'XLSX',
        icon: <AiFillFileExcel title="Excel export" />,
        title: _ts('export', 'xlsxLabel'),
    },
    {
        key: 'JSON',
        icon: <AiFillFileText title="JSON Export" />,
        title: _ts('export', 'jsonLabel'),
    },
];

function exportTypeKeySelector(d: ExportTypeItem) {
    return d.key;
}

function ExportTypeInput() {
    const [exportFileFormat, setExportFileFormat] = useState<ExportFormatEnum>('DOCX');
    const [
        advancedOptionsModalShown,
        showAdvancedOptionsModal,
        hideAdvancedOptionsModal,
    ] = useModalState(false);

    const exportTypeRendererParams = useCallback((key: ExportFormatEnum, data: ExportTypeItem) => {
        const {
            title,
            icon,
        } = data;

        return ({
            buttonKey: key,
            title,
            icon,
            isActive: exportFileFormat === key,
            onActiveExportFormatChange: setExportFileFormat,
        });
    }, [exportFileFormat, setExportFileFormat]);

    return (
        <div>
            <List
                data={exportTypes}
                rendererParams={exportTypeRendererParams}
                renderer={ExportTypeButton}
                keySelector={exportTypeKeySelector}
            />
            {exportFileFormat !== 'JSON' && (
                <Button
                    name="undefined"
                    variant="action"
                    onClick={showAdvancedOptionsModal}
                >
                    Advanced
                </Button>
            )}
            {advancedOptionsModalShown && (
                <Modal
                    size="cover"
                    heading="Advanced Options"
                    onCloseButtonClick={hideAdvancedOptionsModal}
                >
                    <AdvancedOptionsSelection
                        exportFileFormat={exportFileFormat}
                    />
                </Modal>
            )}
        </div>

    );
}

export default ExportTypeInput;
