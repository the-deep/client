import update from '#rs/utils/immutable-update';

export const EEB__SET_LEAD = 'siloDomainData/EEB__SET_LEAD';

export const editEntriesSetLeadAction = ({ lead }) => ({
    type: EEB__SET_LEAD,
    lead,
});

const setLead = (state, action) => {
    const { lead } = action;
    const leadId = lead.id;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                lead: { $set: lead },
            } },
        } },
    };
    return update(state, settings);
};

const reducers = {
    [EEB__SET_LEAD]: setLead,
};
export default reducers;
