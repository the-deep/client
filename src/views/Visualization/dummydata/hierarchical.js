export default {
    name: 'TOPICS',
    children: [{
        name: 'Health',
        children: [{
            name: 'Population',
            size: 4,
        }, {
            name: 'Diseases',
            size: 4,
        }],
    }, {
        name: 'Crisis',
        children: [{
            name: 'Hunger',
            size: 3,
        }, {
            name: 'Famine',
            size: 3,
        }, {
            name: 'Death',
            size: 3,
        }],
    }, {
        name: 'Refugees',
        children: [{
            name: 'Migration',
            size: 4,
        }, {
            name: 'Trafficking',
            size: 4,
        }],
    }, {
        name: 'Disasters',
        children: [{
            name: 'Earthquake',
            size: 4,
        }, {
            name: 'Landslide',
            size: 4,
        }, {
            name: 'Wildfire',
            size: 4,
        }],
    }, {
        name: 'Environment',
        children: [{
            name: 'Deforestation',
            size: 4,
        }, {
            name: 'Pollution',
            size: 4,
        }, {
            name: 'Global warming',
            size: 4,
        }, {
            name: 'Public health',
            size: 4,
        }],
    }],
};
