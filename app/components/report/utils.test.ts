import { aggregate } from './utils';

const data = [
    {"id":1,"last_name":"Ibbett","email":"kibbett0@google.co.jp","gender":"Female","salary":155385},
    {"id":2,"last_name":"Byatt","email":"abyatt1@drupal.org","gender":"Male","salary":204923},
    {"id":3,"last_name":"Cullington","email":"ccullington2@nhs.uk","gender":"Male","salary":287471},
    {"id":4,"last_name":"Dews","email":"rdews3@cnbc.com","gender":"Male","salary":293003},
    {"id":5,"last_name":"Georgi","email":"bgeorgi4@dailymail.co.uk","gender":"Female","salary":489667},
    {"id":6,"last_name":"Hawtry","email":"ghawtry5@addtoany.com","gender":"Female","salary":361258},
    {"id":7,"last_name":"Strete","email":"jstrete6@cnet.com","gender":"Female","salary":437091},
    {"id":8,"last_name":"Matthews","email":"lmatthews7@zdnet.com","gender":"Female","salary":98391},
    {"id":9,"last_name":"Mechem","email":"bmechem8@mtv.com","gender":"Female","salary":165359},
    {"id":10,"last_name":"Furse","email":"cfurse9@rakuten.co.jp","gender":"Female","salary":145627},
    {"id":11,"last_name":"Graham","email":"egrahama@webnode.com","gender":"Female","salary":206462},
    {"id":12,"last_name":"Leyman","email":"lleymanb@ameblo.jp","gender":"Male","salary":323183},
    {"id":13,"last_name":"Faccini","email":"jfaccinic@mapquest.com","gender":"Male","salary":435426},
    {"id":14,"last_name":"Beardsdale","email":"rbeardsdaled@independent.co.uk","gender":"Male","salary":89699},
    {"id":15,"last_name":"Van der Kruys","email":"pvanderkruyse@eventbrite.com","gender":"Female","salary":68226},
    {"id":16,"last_name":"Goudy","email":"bgoudyf@slideshare.net","gender":"Male","salary":188998},
    {"id":17,"last_name":"Swindlehurst","email":"mswindlehurstg@nhs.uk","gender":"Female","salary":172202},
    {"id":18,"last_name":"Shattock","email":"bshattockh@reuters.com","gender":"Female","salary":103644},
    {"id":19,"last_name":"Franzolini","email":"lfranzolinii@chronoengine.com","gender":"Male","salary":410628},
    {"id":20,"last_name":"Lansly","email":"rlanslyj@miitbeian.gov.cn","gender":"Female","salary":399272},
    {"id":21,"last_name":"Bonniface","email":"vbonnifacek@technorati.com","gender":"Female","salary":355587},
    {"id":22,"last_name":"Garmanson","email":"cgarmansonl@army.mil","gender":"Female","salary":429430},
    {"id":23,"last_name":"Templeman","email":"htemplemanm@loc.gov","gender":"Female","salary":274690},
    {"id":24,"last_name":"Surman","email":"hsurmann@biblegateway.com","gender":"Female","salary":452639},
    {"id":25,"last_name":"O'Hegertie","email":"dohegertieo@skyrock.com","gender":"Female","salary":366323},
    {"id":26,"last_name":"Fairleigh","email":"efairleighp@technorati.com","gender":"Male","salary":150484},
    {"id":27,"last_name":"O'Hartnedy","email":"fohartnedyq@pbs.org","gender":"Female","salary":358323},
    {"id":28,"last_name":"Adnam","email":"aadnamr@guardian.co.uk","gender":"Female"},
    {"id":29,"last_name":"Yoell","email":"myoells@privacy.gov.au","gender":"Female","salary":"135208"},
    {"id":30,"last_name":"Scarf","email":"sscarft@adobe.com","gender":"Male","salary":377849},
    {"id":31,"last_name":"Domenicone","email":"mdomeniconeu@tmall.com","gender":"Female","salary":204800},
    {"id":32,"last_name":"Fairy","email":"rfairyv@geocities.jp","gender":"Male","salary":'asd'},
    {"id":33,"last_name":"O'Siaghail","email":"dosiaghailw@ucla.edu","gender":"Female","salary":87686},
    {"id":34,"last_name":"MacLaughlin","email":"mmaclaughlinx@sina.com.cn","gender":"Male","salary":332392},
    {"id":35,"last_name":"Philimore","email":"lphilimorey@mlb.com","gender":"Female","salary":63021},
    {"id":36,"last_name":"Don","email":"edonz@independent.co.uk","gender":"Female","salary":146454},
    {"id":37,"last_name":"Paulig","email":"npaulig10@jimdo.com","gender":"Female","salary":223290},
    {"id":38,"last_name":"Robelow","email":"crobelow11@scribd.com","gender":"Male","salary":133633},
    {"id":39,"last_name":"Joynt","email":"tjoynt12@npr.org","gender":"Female","salary":56691},
    {"id":40,"last_name":"Bennellick","email":"pbennellick13@sakura.ne.jp","gender":"Male","salary":462248},
];

test('aggregate', () => {
    expect(
        aggregate(data, (item) => item.gender, (item) => item.salary, 'sum'),
    ).toEqual([
        {
            key: 'Female',
            value: 5956726,
        },
        {
            key: 'Male',
            value: 3689937,
        },
    ]);
    expect(
        aggregate(data, (item) => item.gender, (item) => item.salary, 'mean'),
    ).toEqual([
        {
            key: 'Female',
            value: 238269.04,
        },
        {
            key: 'Male',
            value: 283841.3076923077,
        },
    ]);
    /* FIXME: Fix median calculation
    expect(
        aggregate(data, (item) => item.gender, (item) => item.salary, 'median'),
    ).toEqual([
        {
            key: 'Female',
            value: 204800,
        },
        {
            key: 'Male',
            value: 293003,
        },
    ]);
    */
    expect(
        aggregate(data, (item) => item.gender, (item) => item.salary, 'min'),
    ).toEqual([
        {
            key: 'Female',
            value: 56691,
        },
        {
            key: 'Male',
            value: 89699,
        },
    ]);
    expect(
        aggregate(data, (item) => item.gender, (item) => item.salary, 'max'),
    ).toEqual([
        {
            key: 'Female',
            value: 489667,
        },
        {
            key: 'Male',
            value: 462248,
        },
    ]);
});
