import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#dui/Button';
import FullPageHeader from '#components/general/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#dui/BackLink';
import TextArea from '#dui/TextArea';
import Heading from '#dui/Heading';

import _ts from '#ts';

import styles from './styles.scss';

interface PageProps {
}

function PillarAnalysis(props: PageProps) {
    const [value, setValue] = useState<string | undefined>('');

    return (
        <div className={styles.pillarAnalysis}>
            <FullPageHeader
                className={styles.header}
                actionsClassName={styles.actions}
                actions={(
                    <>
                        <Button
                            className={styles.button}
                            variant="primary"
                        >
                            {_ts('pillarAnalysis', 'saveButtonLabel')}
                        </Button>
                        <BackLink
                            className={styles.button}
                            defaultLink="/"
                        >
                            {_ts('pillarAnalysis', 'closeButtonLabel')}
                        </BackLink>
                    </>
                )}
            >
                {breadcrumb('abc', 'def')}
            </FullPageHeader>
            <div className={styles.content}>
                <div className={styles.inputsContainer}>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'mainStatementLabel')}
                        </Heading>
                        <TextArea
                            value={value}
                            onChange={setValue}
                            rows={10}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'infoGapLabel')}
                        </Heading>
                        <TextArea
                            value={value}
                            onChange={setValue}
                            rows={10}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PillarAnalysis;
