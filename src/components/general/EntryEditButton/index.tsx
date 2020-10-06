import React from 'react';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ScrollTabs from '#rscv/ScrollTabs';

import EditEntryForm from '#components/general/EditEntryForm';

import { EntryFields } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';
import _ts from '#ts';

import styles from './styles.scss';

const tabs = {
    overview: _ts('editEntry', 'overviewTabTitle'),
    list: _ts('editEntry', 'listTabTitle'),
};

interface EntryEditButtonProps {
    className?: string;
    entry: EntryFields;
    framework: FrameworkFields;
}

function EntryEditButton(props: EntryEditButtonProps) {
    const {
        entry,
        className,
        framework,
    } = props;

    const [activeTab, setActiveTab] = React.useState('overview');
    const [showModal, setShowModal] = React.useState(false);

    const handleEntryEdit = React.useCallback(() => {
        setShowModal(true);
    }, [setShowModal]);

    const handleSaveButtonClick = React.useCallback(() => {
    }, []);

    const handleCancelButtonClick = React.useCallback(() => {
        setShowModal(false);
    }, [setShowModal]);

    return (
        <>
            <Button
                className={className}
                iconName="edit"
                onClick={handleEntryEdit}
            />
            {showModal && (
                <Modal className={styles.editEntryModal}>
                    <ModalHeader
                        title={_ts('components.entryEditButton', 'editModalHeading')}
                        rightComponent={(
                            <ScrollTabs
                                className={styles.tabs}
                                tabs={tabs}
                                active={activeTab}
                                onClick={setActiveTab}
                            />
                        )}
                    />
                    <ModalBody>
                        <EditEntryForm
                            mode={activeTab}
                            framework={framework}
                            entry={entry}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleCancelButtonClick}>
                            {_ts('components.entryEditButton', 'cancelButtonLabel')}
                        </Button>
                        <PrimaryButton onClick={handleSaveButtonClick}>
                            {_ts('components.entryEditButton', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            )}
        </>
    );
}

export default EntryEditButton;
