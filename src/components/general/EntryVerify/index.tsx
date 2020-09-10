import React, { useState, useCallback, useEffect } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import Cloak from '#components/general/Cloak';
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

import styles from './styles.scss';

interface ComponentProps {
    id: number;
    verified: boolean;
    hide: (entryPermission) => boolean;
    className?: string;
}

interface Params {
    setVerificationStatus: () => void;
    verify: boolean;
}

interface VerificationOption {
    key: string;
    value: string;
    isVerified: boolean;
}

const verificationStatusOptions: VerificationOption[] = [
    {
        key: 'verified',
        value: 'Verified',
        isVerifed: true,
    },
    {
        key: 'unverified',
        value: 'Unverified',
        isVerifed: false,
    },
];


type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    setEntryVerification: {
        url: ({ props: { id } }) => `/entries/${id}/verify/`,
        method: methods.POST,
        query: ({ params: { verify } }) => ({ verify }),
        onSuccess: ({ params }) => {
            const { setVerificationStatus, verify } = params;
            if (setVerificationStatus) {
                setVerificationStatus(verify);
            }
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

    const [verified, setVerificationStatus] = useState(verifiedFromProps || false);

    useEffect(() => {
        setVerificationStatus(verifiedFromProps);
    }, [verifiedFromProps]);

    const selectedOption = verificationStatusOptions.find(v => v.isVerifed === verified);

    const handleItemSelect = useCallback((key: VerificationOption.key) => {
        const verify = verificationStatusOptions.find(
            v => v.key === key,
        ).isVerifed;
        setEntryVerification.do({
            verify,
            setVerificationStatus,
        });
    }, [setEntryVerification]);

    return (
        <div className={_cs(className, styles.verifyContainer)}>
            <div>
                {selectedOption && selectedOption.value}
            </div>
            <Cloak
                hide={hide}
                render={
                    <DropdownEdit
                        currentSelection={selectedOption.key}
                        className={styles.dropdown}
                        options={verificationStatusOptions}
                        onItemSelect={handleItemSelect}
                    />
                }
            />
        </div>
    );
}

export default RequestClient(requestOptions)(
    EntryVerify,
);
