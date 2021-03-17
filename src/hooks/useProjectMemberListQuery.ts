import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    MultiResponse,
    DatabaseEntityBase,
} from '#typings';
import _ts from '#ts';

const memberFieldQuery = {
    fields: ['id', 'displayName'],
};

export interface Member {
    id: number;
    displayName: string;
}

export const memberKeySelector = (d: Member) => d.id;
export const memberNameSelector = (d: Member) => d.displayName;

function useProjectmemberListQuery(projectId: DatabaseEntityBase['id']): [
    boolean,
    MultiResponse<Member> | undefined
] {
    const [
        pending,
        response,
    ] = useRequest<MultiResponse<Member>>({
        url: `server://v2/projects/${projectId}/members/`,
        method: 'GET',
        query: memberFieldQuery,
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('entryReview', 'reviewHeading'))({ error: errorBody });
        },
    });

    return [
        pending,
        response,
    ];
}

export default useProjectmemberListQuery;
