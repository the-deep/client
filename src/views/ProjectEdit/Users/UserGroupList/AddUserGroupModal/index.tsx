import React from 'react';

import { Modal } from '@the-deep/deep-ui';

import { UserGroup } from '#typings';
import styles from './styles.scss';

interface Props {
    onModalClose: () => void;
    usergroupList: UserGroup[];
}

function AddUserGroupModal(props: Props) {
    const {
        onModalClose,
        usergroupList,
    } = props;

    console.warn('usergroup list', usergroupList);

    return (
        <Modal
            className={styles.addUsergroup}
            heading="Add Usergroup"
            onClose={onModalClose}
        >
            This is Modal Body
        </Modal>
    );
}

export default AddUserGroupModal;
