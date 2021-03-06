import update from '#rsu/immutable-update';

// TYPE

export const V__SET_LEAD_VISUALIZATION = 'siloDomainData/SET_LEAD_VISUALIZATION';

// ACTION-CREATOR

export const setLeadVisualizationAction = ({
    projectId, hierarchial, correlation, keywordCorrelation, geoPoints,
}) => ({
    type: V__SET_LEAD_VISUALIZATION,
    projectId,
    hierarchial,
    correlation,
    keywordCorrelation,
    geoPoints,
});

// UTILS
const getHierarchialTopic = (keywords) => {
    const topic = keywords.reduce((acc, keyword) => {
        const [first, second] = keyword;
        if (second > acc.size && Number.isNaN(parseInt(first, 10))) {
            acc.name = first;
            acc.size = Math.round(second * 100);
        }
        return acc;
    }, { name: '', size: 0, subtopics: [] });
    return topic;
};

const getHierarchialData = (hierarchial = {}) => {
    const { keywords } = hierarchial;

    if (!keywords) {
        return Object.values(hierarchial).map(d => (
            getHierarchialData(d)
        )).filter(f => f.size === undefined || f.size > 0);
    }

    const { subtopics } = hierarchial;
    const topic = getHierarchialTopic(keywords, subtopics);
    const children = getHierarchialData(subtopics);

    if (children && children.length > 0) {
        topic.size = undefined;
        topic.children = children;
    }

    return topic;
};

const getCorrelationData = (correlation, scale = 1) => {
    const labels = Object.keys(correlation);
    const values = [];

    labels.forEach(label => (
        values.push(labels.map(l => scale * correlation[label][l]))
    ));

    return {
        labels,
        values,
    };
};

/*
const getForceDirectedData = (correlation) => {
    const labels = Object.keys(correlation);
    const links = [];

    const nodes = labels.map(c => ({
        id: c, group: 0,
    }));

    labels.forEach(label => (
        links.push(...labels.map(l => ({
            source: label,
            target: l,
            value: correlation[label][l],
        })).filter(l => l.value > 0.8)) // TODO: threshold
    ));

    return { nodes, links };
};
*/

const getGeoPointsData = (geoPoints) => {
    const points = [];
    geoPoints.forEach((p) => {
        const { info } = p;
        const { geometry } = info;
        if (geometry) {
            const { lat, lng } = geometry.location;
            points.push({
                title: info.formatted_address || p.name,
                coordinates: [lng, lat],
            });
        }
    });
    return points;
};

// REDUCER

const setLeadVisualization = (state, action) => {
    const {
        hierarchial,
        correlation,
        keywordCorrelation,
        geoPoints,
        projectId,
    } = action;

    const settings = {
        visualization: {
            [projectId]: { $auto: {
                stale: {
                    $set: false,
                },
            } },
        },
    };

    if (hierarchial) {
        settings.visualization[projectId].$auto.hierarchialData = {
            $auto: {
                children: { $autoArray: {
                    $set: getHierarchialData(hierarchial),
                } },
            },
        };
    }

    if (correlation) {
        settings.visualization[projectId].$auto = {
            ...settings.visualization[projectId].$auto,
            correlationData: {
                $auto: { $set: getCorrelationData(correlation) },
            },
            chordData: {
                $auto: { $set: getCorrelationData(correlation, 100) },
            },
        };
    }

    if (keywordCorrelation) {
        settings.visualization[projectId].$auto = {
            forceDirectedData: {
                // $auto: { $set: getForceDirectedData(keywordCorrelation) },
                $auto: { $set: keywordCorrelation },
            },
        };
    }

    if (geoPoints) {
        settings.visualization[projectId].$auto.geoPointsData = { $auto: {
            points: { $autoArray: {
                $set: getGeoPointsData(geoPoints),
            } },
        } };
    }

    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [V__SET_LEAD_VISUALIZATION]: setLeadVisualization,
};
export default reducers;
