import React, { useContext, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import { UserContext } from '#base/context/UserContext';
import PreloadMessage from '#base/components/PreloadMessage';
import { checkErrorCode } from '#base/utils/apollo';

import {
    MeQuery,
} from '#generated/types';

const ME = gql`
    query Me {
        me {
            id
            displayName
            displayPictureUrl
            lastActiveProject
        }
    }
`;

interface Props {
    className?: string;
    children: React.ReactNode;
}
function Init(props: Props) {
    const {
        className,
        children,
    } = props;

    const [ready, setReady] = useState(false);
    const [errored, setErrored] = useState(false);

    const {
        setUser,
    } = useContext(UserContext);

    useQuery<MeQuery>(ME, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            const safeMe = removeNull(data.me);
            if (safeMe) {
                setUser({ ...safeMe, permissions: [] });
            } else {
                setUser(undefined);
            }
            setReady(true);
        },
        onError: (error) => {
            const { graphQLErrors } = error;
            const authError = checkErrorCode(
                graphQLErrors,
                ['me'],
                '401',
            );

            setErrored(!authError);
            /*
            setUser({
                id: '12',
                displayName: 'Ram',
                permissions: [],
            });
            */
            setReady(true);
        },
    });

    if (errored) {
        return (
            <PreloadMessage
                className={className}
                heading="Oh no!"
                content="Some error occurred"
            />
        );
    }
    if (!ready) {
        return (
            <PreloadMessage
                className={className}
                content="Checking user session..."
            />
        );
    }

    // NOTE: wrapping in fragment to avoid typing error
    return <>{children}</>;
}
export default Init;
