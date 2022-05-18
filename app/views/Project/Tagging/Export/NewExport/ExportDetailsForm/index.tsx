import React, { useState } from 'react';
import {
    TextInput,
} from '@the-deep/deep-ui';
import {
    ExportFormatEnum,
} from '#generated/types';

import ExportTypeInput from './ExportTypeInput';
import styles from './styles.css';

function ExportDetailsForm() {
    const [queryTitle, setQueryTitle] = useState<string | undefined>();
    const [activeExportFormat, setActiveExportFormat] = useState<ExportFormatEnum>('DOCX');
    return (
        <div className={styles.exportDetails}>
            <div className={styles.topSection}>
                <TextInput
                    name="queryTitle"
                    value={queryTitle}
                    onChange={setQueryTitle}
                    label="Export Title"
                    placeholder="Export Title"
                />
                <ExportTypeInput />
            </div>
        </div>
    );
}

export default ExportDetailsForm;
