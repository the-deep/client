import React, { useState, useCallback, useMemo, useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    TextArea,
    Modal,
    Button,
    ListView,
    Container,
} from '@the-deep/deep-ui';

import ExcerptInput from '#components/entry/ExcerptInput';

import {
    PartialAnalyticalStatementType,
} from '../../schema';
import EntryContext, { EntryMin } from '../../context';

import styles from './styles.css';

const keySelector = (item: EntryMin) => item.id;

interface Props {
    onModalClose: () => void,
    statementId: string | undefined;
    mainStatement: string | undefined,
    onStatementChange: (newVal: string | undefined) => void;
    analyticalEntries: PartialAnalyticalStatementType['entries'];
}

function MoreDetailsModal(props: Props) {
    const {
        onModalClose,
        mainStatement,
        onStatementChange,
        statementId,
        analyticalEntries,
    } = props;

    const { entries } = useContext(EntryContext);
    const [tempMainStatement, setTempMainStatement] = useState<string | undefined>(mainStatement);
    const [pristine, setPristine] = useState(true);

    const entriesForNgrams = useMemo(() => (
        analyticalEntries?.map(
            (ae) => (ae.entry ? entries?.[ae.entry] : undefined),
        ).filter(isDefined) ?? []
    ), [entries, analyticalEntries]);

    const handleCompleteStatement = useCallback(() => {
        onStatementChange(tempMainStatement);
        setPristine(true);
    }, [tempMainStatement, onStatementChange]);

    const handleStatementChange = useCallback((newVal: string | undefined) => {
        setPristine(false);
        setTempMainStatement(newVal);
    }, []);

    const entriesRendererParams = useCallback((_: string, data: EntryMin) => ({
        className: styles.excerpt,
        value: data.excerpt,
        entryType: data.entryType,
        image: data.image,
        imageRaw: undefined,
        leadImageUrl: undefined,
        readOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onChange: () => {},
        name: 'excerpt',
    }), []);

    return (
        <Modal
            className={styles.moreDetailsModal}
            heading="Data Aggregation Column"
            onCloseButtonClick={onModalClose}
            size="cover"
            bodyClassName={styles.modalBody}
        >
            <Container
                className={styles.topContainer}
                footerActions={(
                    <Button
                        name={statementId}
                        disabled={pristine}
                        onClick={handleCompleteStatement}
                    >
                        Complete Statement
                    </Button>
                )}
            >
                <TextArea
                    name="mainStatement"
                    label="Analytical Statement"
                    onChange={handleStatementChange}
                    value={tempMainStatement}
                    rows={5}
                />
            </Container>
            <div className={styles.bottomContainer}>
                {entriesForNgrams.length > 0 && (
                    <Container
                        className={styles.entriesContainer}
                        heading={`Selected Entries ${analyticalEntries?.length ?? 0}`}
                    >
                        <ListView
                            className={styles.list}
                            data={entriesForNgrams}
                            keySelector={keySelector}
                            renderer={ExcerptInput}
                            rendererParams={entriesRendererParams}
                            filtered={false}
                            errored={false}
                            pending={false}
                        />
                    </Container>
                )}
            </div>
        </Modal>
    );
}

export default MoreDetailsModal;
