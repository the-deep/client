import React, { useState, useCallback, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';

import Cloak from '#components/general/Cloak';
import Icon from '#rscg/Icon';
import DropdownEdit from '#components/general/DropdownEdit';

import {
    AddRequestProps,
    Requests,
} from '#typings';

import {
    RequestClient,
    methods,
} from '#request';
import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

interface ComponentProps {
    id: boolean;
    verified: boolean;
    hide: (entryPermission) => boolean;
    className?: string;
}

interface Params {
    setVerificationStatus: (status: boolean) => void;
    verify: boolean;
}

interface VerificationOption {
    key: string;
    value: string;
}

const verificationStatusOptions: VerificationOption[] = [
    {

        key: true,
        value: _ts('editEntry', 'verifiedLabel'),
    },
    {
        key: false,
        value: _ts('editEntry', 'unverifiedLabel'),
    },
];


type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    setEntryVerification: {
        url: ({ props: { id } }) => `/entries/${id}/verify/`,
        method: methods.POST,
        query: ({ params: { verify } }) => ({ verify }),
        onSuccess: ({ params = {} }) => {
            const { setVerificationStatus, verify } = params;
            if (setVerificationStatus) {
                setVerificationStatus(!!verify);
            }
            notify.send({
                title: _ts('editEntry', 'entryVerificationStatusChange'),
                type: notify.type.SUCCESS,
                message: _ts('editEntry', 'entryVerificationStatusChangeSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: notifyOnFailure(_ts('editEntry', 'entryVerifyFailure')),
        onFatal: notifyOnFatal(_ts('editEntry', 'entryVerifyFailure')),
    },
};

function EntryVerify(props: Props) {
    const {
        className,
        hide,
        verified: verifiedFromProps = false,
        requests,
    } = props;
    const {
        setEntryVerification,
    } = requests;

    const [verified, setVerificationStatus] = useState(verifiedFromProps);

    useEffect(() => {
        setVerificationStatus(verifiedFromProps);
    }, [verifiedFromProps]);

    const selectedOption = verificationStatusOptions.find(v => v.key === verified);

    const handleItemSelect = useCallback((key: boolean) => {
        setEntryVerification.do({
            verify: key,
            setVerificationStatus,
        });
    }, [setEntryVerification]);

    return (
        <div className={_cs(className, styles.verifyContainer)}>
            <Cloak
                hide={hide}
                render={
                    <DropdownEdit
                        currentSelection={selectedOption && selectedOption.key}
                        className={styles.dropdown}
                        options={verificationStatusOptions}
                        onItemSelect={handleItemSelect}
                        dropdownIcon=""
                        dropdownLeftComponent={(
                            <div className={styles.label}>
                                <Icon
                                    name={verified ? 'checkOutlined' : 'help'}
                                    className={verified
                                        ? styles.verifiedIcon
                                        : styles.unverifiedIcon
                                    }
                                />
                                {selectedOption && selectedOption.value}
                            </div>
                        )}
                    />
                }
                renderOnHide={(
                    <div className={styles.label}>
                        <Icon
                            name={verified && 'check'}
                            className={styles.verifiedIcon}
                        />
                        {selectedOption && selectedOption.value}
                    </div>
                )}
            />
        </div>
    );
}

export default RequestClient(requestOptions)(
    EntryVerify,
);
