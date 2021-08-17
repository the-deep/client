import { useRequest } from '#base/utils/restRequest';
import {
    MultiResponse,
    DatabaseEntityBase,
    Membership,
} from '#types';

const memberFieldQuery = {
    fields: ['member', 'member_name'],
};

export const memberKeySelector = (d: Membership) => d.member;
export const memberNameSelector = (d:Membership) => d.memberName;

function useProjectMemberListQuery(projectId: DatabaseEntityBase['id']): [
    boolean,
    MultiResponse<Membership> | undefined
] {
    const {
        pending,
        response,
    } = useRequest<MultiResponse<Membership>>({
        url: `server://v2/projects/${projectId}/project-memberships/`,
        method: 'GET',
        query: memberFieldQuery,
        failureHeader: 'Project Membership',
    });

    return [
        pending,
        response,
    ];
}

export default useProjectMemberListQuery;
