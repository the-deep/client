const plannedArys = [];

{
    const name = 'plannedAry';
    const schema = {
        doc: {
            name: 'Planned Ary List GET Response',
            description: 'Planned Ary List GET Response',
        },
        fields: {
            title: { type: 'string' },
            project: { type: 'uint' },
            createdAt: { type: 'string', required: true }, // date
            id: { type: 'uint', required: true },
            modifiedAt: { type: 'string', required: true }, // date
            modifiedBy: { type: 'uint' },
            modifiedByName: { type: 'string' },
            createdBy: { type: 'uint' },
            createdByName: { type: 'string' },
        },
    };
    plannedArys.push({ name, schema });
}
{
    const name = 'plannedArysGetResponse';
    const schema = {
        doc: {
            name: 'Planned Assessments List GET Response',
            description: 'Planned Assessments List GET Response',
        },
        fields: {
            count: { type: 'number' },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.plannedAry', required: true },
        },
    };
    plannedArys.push({ name, schema });
}

export default plannedArys;
