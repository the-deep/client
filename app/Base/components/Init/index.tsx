import React, { useContext, useState, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import { UserContext } from '#base/context/UserContext';
import PreloadMessage from '#base/components/PreloadMessage';
import { checkErrorCode } from '#base/utils/apollo';
import localforageInstance from '#base/configs/localforage';

import {
    ProjectContext,
    ProjectContextInterface,
} from '#base/context/ProjectContext';
import { Project } from '#base/types/project';

import FullPageErrorMessage from '#views/FullPageErrorMessage';
import { LAST_ACTIVE_PROJECT_FRAGMENT } from '#gqlFragments';

import { MeQuery } from '#generated/types';

const ME = gql`
    ${LAST_ACTIVE_PROJECT_FRAGMENT}
    query Me {
        me {
            id
            email
            displayName
            displayPictureUrl
            accessibleFeatures {
                key
            }
            lastActiveProject {
                ...LastActiveProjectResponse
            }
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
    const [project, setProject] = useState<Project | undefined>(undefined);

    const {
        setUser,
    } = useContext(UserContext);

    useQuery<MeQuery>(ME, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            const safeMe = removeNull(data.me);
            if (safeMe) {
                setUser(safeMe);
                setProject(safeMe.lastActiveProject ?? undefined);
            } else {
                // FIXME: do we need this else block?
                setUser(undefined);
                setProject(undefined);
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
            setReady(true);

            if (authError) {
                localforageInstance.clear();
            }
        },
    });

    const projectContext: ProjectContextInterface = useMemo(
        () => ({
            project,
            setProject,
        }),
        [project],
    );

    if (errored) {
        return (
            <FullPageErrorMessage
                className={className}
                errorTitle="Oh no!"
                errorMessage="Some error occured"
                krakenVariant="hi"
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

    return (
        <ProjectContext.Provider value={projectContext}>
            {children}
        </ProjectContext.Provider>
    );
}
export default Init;
