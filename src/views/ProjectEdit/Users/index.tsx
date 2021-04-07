import React, { useCallback } from 'react';
import Faram from '@togglecorp/faram';

import { useModalState } from '#hooks/stateManagement';
import { Button } from '@the-deep/deep-ui';

import AddUsergroupModal from './AddUsergroupModal';
import styles from './styles.scss';


interface UsergroupItem {
    project: string;
    userGroup: string;
    role?: string;
    addedBy?: string;
}

interface Props {
    projectId: number;
}

function UsersPanel(props: Props) {
    const {
        projectId,
    } = props;
    const [
        showAddUsergroupModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const handleAddUsergroupClick = useCallback(() => {
        setModalShow();
    }, [setModalShow]);
    console.warn('show Modal?', showAddUsergroupModal);

    return (
        <div
            className={styles.container}
        >
            <Button
                variant="tertiary"
                className={styles.addUsergroup}
                onClick={handleAddUsergroupClick}
            >
                Add Usergroup
            </Button>
            {showAddUsergroupModal &&
                <AddUsergroupModal
                    onModalClose={setModalHidden}
                    projectId={projectId}
                />
            }
        </div>
    );
}

export default UsersPanel;
