import { AnalysisFramework } from './types';
import {
  filterContexualWidgets,
  createReportStructure,
  createReportLevels,
  getWidgets,
  SECTOR_FIRST,
  createReportStructureForExport,
  createWidgetIds,
  getReportStructureVariant,
  isSubSectorIncluded,
  sortReportStructure,
  selectAndSortWidgets,
  DIMENSION_FIRST,
} from './utils';

const analysisFramework = {
  id: '1',
  exportables: [
    {
      data: {
        excel: {
          type: 'multiple',
          titles: [
            'fruits - Dimension',
            'fruits - Subdimension'
          ]
        },
        report: {
          levels: [
            {
              id: 'ef14urs3ymfk23yy',
              title: 'apple',
              sublevels: [
                {
                  id: 'ef14urs3ymfk23yy-n2ayqobf3zv6ycle',
                  title: 'ripe'
                }
              ]
            },
            {
              id: 'o6o8y0bfki5sd1xa',
              title: 'avocado',
              sublevels: [
                {
                  id: 'o6o8y0bfki5sd1xa-ur4tz3nalikmrp80',
                  title: 'ripe'
                }
              ]
            }
          ]
        }
      },
      id: '1',
      inline: false,
      order: 1,
      widgetKey: 'kpdn2663nioq6wqu',
      widgetType: 'MATRIX1D',
      widgetTypeDisplay: 'Matrix1D'
    },
    {
      data: {
        excel: {
          type: 'multiple',
          titles: [
            'color combinations - Row',
            'color combinations - SubRow',
            'color combinations - Column',
            'color combinations - SubColumns'
          ]
        },
        report: {
          levels: [
            {
              id: 'zj93mmfo7jp4hpr7',
              title: 'value',
              sublevels: [
                {
                  id: 'zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle',
                  title: 'color',
                  sublevels: [
                    {
                      id: 'zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk',
                      title: 'primary'
                    },
                    {
                      id: 'zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58',
                      title: 'secondary'
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      id: '2',
      inline: false,
      order: 1,
      widgetKey: 'qfepnxfmk0ytzh0a',
      widgetType: 'MATRIX2D',
      widgetTypeDisplay: 'Matrix2D'
    },
    {
      data: {
        excel: {
          title: 'text'
        }
      },
      id: '3',
      inline: false,
      order: 1,
      widgetKey: 'wmsn5hrtco52xu4x',
      widgetType: 'TEXT',
      widgetTypeDisplay: 'Text'
    },
    {
      data: {
        excel: {
          title: 'number',
          col_type: 'number'
        }
      },
      id: '4',
      inline: false,
      order: 1,
      widgetKey: '2wabftmvlxtbz2p6',
      widgetType: 'NUMBER',
      widgetTypeDisplay: 'Number'
    },
    {
      data: {
        excel: {
          type: 'multiple',
          titles: [
            'date range (From)',
            'date range (To)'
          ],
          col_type: [
            'date',
            'date'
          ]
        }
      },
      id: '5',
      inline: false,
      order: 1,
      widgetKey: '3lhec2v5ogt0dbpw',
      widgetType: 'DATE_RANGE',
      widgetTypeDisplay: 'Date Range'
    },
    {
      data: {
        excel: {
          type: 'multiple',
          titles: [
            'time range (From)',
            'time range (To)'
          ],
          col_type: [
            'time',
            'time'
          ]
        }
      },
      id: '6',
      inline: false,
      order: 1,
      widgetKey: '9qcmoxmr6cv2vey5',
      widgetType: 'TIME_RANGE',
      widgetTypeDisplay: 'Time Range'
    }
  ],
  filters: [
    {
      id: '3',
      key: 'qfepnxfmk0ytzh0a-columns',
      widgetKey: 'qfepnxfmk0ytzh0a',
      widgetType: 'MATRIX2D'
    },
    {
      id: '2',
      key: 'qfepnxfmk0ytzh0a-rows',
      widgetKey: 'qfepnxfmk0ytzh0a',
      widgetType: 'MATRIX2D'
    },
    {
      id: '6',
      key: '3lhec2v5ogt0dbpw',
      widgetKey: '3lhec2v5ogt0dbpw',
      widgetType: 'DATE_RANGE'
    },
    {
      id: '1',
      key: 'kpdn2663nioq6wqu',
      widgetKey: 'kpdn2663nioq6wqu',
      widgetType: 'MATRIX1D'
    },
    {
      id: '5',
      key: '2wabftmvlxtbz2p6',
      widgetKey: '2wabftmvlxtbz2p6',
      widgetType: 'NUMBER'
    },
    {
      id: '4',
      key: 'wmsn5hrtco52xu4x',
      widgetKey: 'wmsn5hrtco52xu4x',
      widgetType: 'TEXT'
    },
    {
      id: '7',
      key: '9qcmoxmr6cv2vey5',
      widgetKey: '9qcmoxmr6cv2vey5',
      widgetType: 'TIME_RANGE'
    }
  ],
  primaryTagging: [
    {
      widgets: [
        {
          id: '1',
          clientId: '1',
          key: 'kpdn2663nioq6wqu',
          order: 1,
          properties: {
            rows: [
              {
                key: 'ef14urs3ymfk23yy',
                cells: [
                  {
                    key: 'n2ayqobf3zv6ycle',
                    label: 'ripe',
                    order: 1
                  }
                ],
                label: 'apple',
                order: 1
              },
              {
                key: 'o6o8y0bfki5sd1xa',
                cells: [
                  {
                    key: 'ur4tz3nalikmrp80',
                    label: 'ripe',
                    order: 1
                  }
                ],
                label: 'avocado',
                order: 2
              }
            ]
          },
          conditional: null,
          title: 'fruits',
          widgetId: 'MATRIX1D',
          width: 'FULL',
          version: 1
        },
        {
          id: '2',
          clientId: '2',
          key: 'qfepnxfmk0ytzh0a',
          order: 2,
          properties: {
            rows: [
              {
                key: 'cw4vvh7j5e3q5rle',
                color: null,
                label: 'color',
                order: 1,
                subRows: [
                  {
                    key: 'bdwa0caijzu2vlfk',
                    label: 'primary',
                    order: 1,
                    tooltip: null
                  },
                  {
                    key: '4q93bn1ss9o0qx58',
                    label: 'secondary',
                    order: 2,
                    tooltip: null
                  }
                ],
                tooltip: null
              }
            ],
            columns: [
              {
                key: 'zj93mmfo7jp4hpr7',
                label: 'value',
                order: 1,
                tooltip: null,
                subColumns: [
                  {
                    key: '74hddg4ytza5dlka',
                    label: 'hari',
                    order: 1,
                    tooltip: null
                  },
                  {
                    key: 'zof6o8ltzdb58u15',
                    label: 'shyam',
                    order: 2,
                    tooltip: null
                  }
                ]
              }
            ]
          },
          conditional: null,
          title: 'color combinations',
          widgetId: 'MATRIX2D',
          width: 'FULL',
          version: 1
        }
      ],
      clientId: '1',
      id: '1',
      order: 1,
      title: 'first',
      tooltip: null
    }
  ],
  secondaryTagging: [
    {
      clientId: '3',
      id: '3',
      key: 'wmsn5hrtco52xu4x',
      order: 1,
      title: 'text',
      properties: {},
      conditional: null,
      widgetId: 'TEXT',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '4',
      id: '4',
      key: '2wabftmvlxtbz2p6',
      order: 2,
      title: 'number',
      properties: {},
      conditional: null,
      widgetId: 'NUMBER',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1
    }
  ]
};

test('get all widgets of framework', () => {
  expect(getWidgets(undefined)).toStrictEqual(undefined);
  expect(getWidgets(null)).toStrictEqual(undefined);
  expect(getWidgets({
    id: 1,
  })).toStrictEqual([]);
  expect(getWidgets({
    id: 1,
    primaryTagging: [],
    secondaryTagging: [],
  })).toStrictEqual([]);
  expect(getWidgets({
    id: 1,
    primaryTagging: [],
    secondaryTagging: [],
  })).toStrictEqual([]);
  expect(getWidgets(analysisFramework)).toStrictEqual([
    {
      id: '1',
      clientId: '1',
      key: 'kpdn2663nioq6wqu',
      order: 1,
      properties: {
        rows: [
          {
            key: 'ef14urs3ymfk23yy',
            cells: [
              {
                key: 'n2ayqobf3zv6ycle',
                label: 'ripe',
                order: 1
              }
            ],
            label: 'apple',
            order: 1
          },
          {
            key: 'o6o8y0bfki5sd1xa',
            cells: [
              {
                key: 'ur4tz3nalikmrp80',
                label: 'ripe',
                order: 1
              }
            ],
            label: 'avocado',
            order: 2
          }
        ]
      },
      conditional: null,
      title: 'fruits',
      widgetId: 'MATRIX1D',
      width: 'FULL',
      version: 1
    },
    {
      id: '2',
      clientId: '2',
      key: 'qfepnxfmk0ytzh0a',
      order: 2,
      properties: {
        rows: [
          {
            key: 'cw4vvh7j5e3q5rle',
            color: null,
            label: 'color',
            order: 1,
            subRows: [
              {
                key: 'bdwa0caijzu2vlfk',
                label: 'primary',
                order: 1,
                tooltip: null
              },
              {
                key: '4q93bn1ss9o0qx58',
                label: 'secondary',
                order: 2,
                tooltip: null
              }
            ],
            tooltip: null
          }
        ],
        columns: [
          {
            key: 'zj93mmfo7jp4hpr7',
            label: 'value',
            order: 1,
            tooltip: null,
            subColumns: [
              {
                key: '74hddg4ytza5dlka',
                label: 'hari',
                order: 1,
                tooltip: null
              },
              {
                key: 'zof6o8ltzdb58u15',
                label: 'shyam',
                order: 2,
                tooltip: null
              }
            ]
          }
        ]
      },
      conditional: null,
      title: 'color combinations',
      widgetId: 'MATRIX2D',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '3',
      id: '3',
      key: 'wmsn5hrtco52xu4x',
      order: 1,
      title: 'text',
      properties: {},
      conditional: null,
      widgetId: 'TEXT',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '4',
      id: '4',
      key: '2wabftmvlxtbz2p6',
      order: 2,
      title: 'number',
      properties: {},
      conditional: null,
      widgetId: 'NUMBER',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1
    },
  ]);
});

test('get contextual widgets only', () => {
  expect(filterContexualWidgets(undefined)).toStrictEqual(undefined);
  expect(filterContexualWidgets([])).toStrictEqual([]);
  expect(filterContexualWidgets([
    {
      clientId: '3',
      id: '3',
      key: 'wmsn5hrtco52xu4x',
      order: 1,
      title: 'text',
      properties: {},
      conditional: null,
      widgetId: 'TEXT',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '4',
      id: '4',
      key: '2wabftmvlxtbz2p6',
      order: 2,
      title: 'number',
      properties: {},
      conditional: null,
      widgetId: 'NUMBER',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1
    }
  ])).toStrictEqual([
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1
    }
  ]);
  expect(filterContexualWidgets([
    {
      id: '1',
      clientId: '1',
      key: 'kpdn2663nioq6wqu',
      order: 1,
      properties: {
        rows: [
          {
            key: 'ef14urs3ymfk23yy',
            cells: [
              {
                key: 'n2ayqobf3zv6ycle',
                label: 'ripe',
                order: 1
              }
            ],
            label: 'apple',
            order: 1
          },
          {
            key: 'o6o8y0bfki5sd1xa',
            cells: [
              {
                key: 'ur4tz3nalikmrp80',
                label: 'ripe',
                order: 1
              }
            ],
            label: 'avocado',
            order: 2
          }
        ]
      },
      conditional: null,
      title: 'fruits',
      widgetId: 'MATRIX1D',
      width: 'FULL',
      version: 1
    },
    {
      id: '2',
      clientId: '2',
      key: 'qfepnxfmk0ytzh0a',
      order: 2,
      properties: {
        rows: [
          {
            key: 'cw4vvh7j5e3q5rle',
            color: null,
            label: 'color',
            order: 1,
            subRows: [
              {
                key: 'bdwa0caijzu2vlfk',
                label: 'primary',
                order: 1,
                tooltip: null
              },
              {
                key: '4q93bn1ss9o0qx58',
                label: 'secondary',
                order: 2,
                tooltip: null
              }
            ],
            tooltip: null
          }
        ],
        columns: [
          {
            key: 'zj93mmfo7jp4hpr7',
            label: 'value',
            order: 1,
            tooltip: null,
            subColumns: [
              {
                key: '74hddg4ytza5dlka',
                label: 'hari',
                order: 1,
                tooltip: null
              },
              {
                key: 'zof6o8ltzdb58u15',
                label: 'shyam',
                order: 2,
                tooltip: null
              }
            ]
          }
        ]
      },
      conditional: null,
      title: 'color combinations',
      widgetId: 'MATRIX2D',
      width: 'FULL',
      version: 1
    }
  ])).toStrictEqual([]);
});

test('create report strcuture', () => {
  expect(createReportStructure(SECTOR_FIRST, false, undefined, undefined)).toStrictEqual([]);
  expect(createReportStructure(SECTOR_FIRST, false, { id: 1 }, undefined)).toStrictEqual([]);
  expect(createReportStructure(DIMENSION_FIRST, false, undefined, undefined)).toStrictEqual([]);
  expect(createReportStructure(DIMENSION_FIRST, false, { id: 1 }, undefined)).toStrictEqual([]);
  expect(createReportStructure(SECTOR_FIRST, true, undefined, undefined)).toStrictEqual([]);
  expect(createReportStructure(SECTOR_FIRST, true, { id: 1 }, undefined)).toStrictEqual([]);
  expect(createReportStructure(DIMENSION_FIRST, true, undefined, undefined)).toStrictEqual([]);
  expect(createReportStructure(DIMENSION_FIRST, true, { id: 1 }, undefined)).toStrictEqual([]);
  expect(createReportStructure(
    SECTOR_FIRST,
    false,
    analysisFramework,
    undefined,
  )).toStrictEqual([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        },
        {
          "key": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                },
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "draggable": true,
      "nodes": []
    }
  ]);
  expect(createReportStructure(
    SECTOR_FIRST,
    false,
    analysisFramework,
    [],
  )).toStrictEqual([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        },
        {
          "key": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                },
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "draggable": true,
      "nodes": []
    }
  ]);
  expect(createReportStructure(
    SECTOR_FIRST,
    false,
    analysisFramework,
    [
      {
        "filterKey": "kpdn2663nioq6wqu",
        "value": null,
        "valueList": [
          "n2ayqobf3zv6ycle"
        ],
        "valueGte": null,
        "valueLte": null,
        "includeSubRegions": null,
        "useAndOperator": null,
        "useExclude": null
      }
    ],
  )).toStrictEqual([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                },
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "draggable": true,
      "nodes": []
    }
  ]);
  expect(createReportStructure(
    SECTOR_FIRST,
    true,
    analysisFramework,
    [
      {
        "filterKey": "kpdn2663nioq6wqu",
        "value": null,
        "valueList": [
          "n2ayqobf3zv6ycle"
        ],
        "valueGte": null,
        "valueLte": null,
        "includeSubRegions": null,
        "useAndOperator": null,
        "useExclude": null
      }
    ],
  )).toStrictEqual([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka",
              "title": "hari",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle",
                  "title": "color",
                  "selected": true,
                  "draggable": true,
                  "nodes": [
                    {
                      "key": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                      "title": "primary",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    },
                    {
                      "key": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                      "title": "secondary",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    }
                  ]
                }
              ]
            },
            {
              "key": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15",
              "title": "shyam",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle",
                  "title": "color",
                  "selected": true,
                  "draggable": true,
                  "nodes": [
                    {
                      "key": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                      "title": "primary",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    },
                    {
                      "key": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                      "title": "secondary",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "draggable": true,
      "nodes": []
    }
  ]);
  expect(createReportStructure(
    DIMENSION_FIRST,
    false,
    analysisFramework,
    [
      {
        "filterKey": "kpdn2663nioq6wqu",
        "value": null,
        "valueList": [
          "n2ayqobf3zv6ycle"
        ],
        "valueGte": null,
        "valueLte": null,
        "includeSubRegions": null,
        "useAndOperator": null,
        "useExclude": null
      }
    ],
  )).toStrictEqual([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "cw4vvh7j5e3q5rle",
          "title": "color",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
              "title": "primary",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "value",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                }
              ]
            },
            {
              "key": "cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
              "title": "secondary",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "value",
                  "selected": true,
                  "draggable": true,
                  "nodes": undefined,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "draggable": true,
      "nodes": []
    }
  ]);
  expect(createReportStructure(
    DIMENSION_FIRST,
    true,
    analysisFramework,
    [
      {
        "filterKey": "kpdn2663nioq6wqu",
        "value": null,
        "valueList": [
          "n2ayqobf3zv6ycle"
        ],
        "valueGte": null,
        "valueLte": null,
        "includeSubRegions": null,
        "useAndOperator": null,
        "useExclude": null
      }
    ],
  )).toStrictEqual([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
              "draggable": true,
              "nodes": undefined,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "draggable": true,
      "nodes": [
        {
          "key": "cw4vvh7j5e3q5rle",
          "title": "color",
          "selected": true,
          "draggable": true,
          "nodes": [
            {
              "key": "cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
              "title": "primary",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "value",
                  "selected": true,
                  "draggable": true,
                  "nodes": [
                    {
                      "key": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                      "title": "hari",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    },
                    {
                      "key": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                      "title": "shyam",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    }
                  ]
                }
              ]
            },
            {
              "key": "cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
              "title": "secondary",
              "selected": true,
              "draggable": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "value",
                  "selected": true,
                  "draggable": true,
                  "nodes": [
                    {
                      "key": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                      "title": "hari",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    },
                    {
                      "key": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                      "title": "shyam",
                      "selected": true,
                      "draggable": true,
                      "nodes": undefined,
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "draggable": true,
      "nodes": []
    }
  ]);
});

test('create report levels', () => {
  expect(createReportLevels([])).toStrictEqual([]);
  expect(createReportLevels([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
            }
          ]
        },
        {
          "key": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "selected": true,
          "nodes": [
            {
              "key": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe",
              "selected": true,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "selected": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary",
                  "selected": true,
                },
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary",
                  "selected": true,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "nodes": []
    }
  ])).toStrictEqual([
    {
      "id": "1",
      "title": "fruits",
      "sublevels": [
        {
          "id": "ef14urs3ymfk23yy",
          "title": "apple",
          "sublevels": [
            {
              "id": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe"
            }
          ]
        },
        {
          "id": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "sublevels": [
            {
              "id": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe"
            }
          ]
        }
      ]
    },
    {
      "id": "2",
      "title": "color combinations",
      "sublevels": [
        {
          "id": "zj93mmfo7jp4hpr7",
          "title": "value",
          "sublevels": [
            {
              "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "sublevels": [
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary"
                },
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "uncategorized",
      "title": "Uncategorized",
      "sublevels": []
    }
  ]);
});
test('create report structure for export', () => {
  expect(createReportStructureForExport([])).toStrictEqual([]);
  expect(createReportStructureForExport([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
            }
          ]
        },
        {
          "key": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "selected": true,
          "nodes": [
            {
              "key": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe",
              "selected": true,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "selected": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary",
                  "selected": true,
                },
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary",
                  "selected": true,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "nodes": []
    }
  ])).toStrictEqual([
    {
      "id": "1",
      "levels": [
        {
          "id": "ef14urs3ymfk23yy",
          "levels": [
            {
              "id": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle"
            }
          ]
        },
        {
          "id": "o6o8y0bfki5sd1xa",
          "levels": [
            {
              "id": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80"
            }
          ]
        }
      ]
    },
    {
      "id": "2",
      "levels": [
        {
          "id": "zj93mmfo7jp4hpr7",
          "levels": [
            {
              "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "levels": [
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk"
                },
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "uncategorized",
      "levels": []
    }
  ]);
});

test('create widget id list', () => {
  expect(createWidgetIds([])).toStrictEqual([]);
  expect(createWidgetIds([
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1,
      selected: false,
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1,
      selected: false,
    }
  ])).toStrictEqual([]);
  expect(createWidgetIds([
    {
        clientId: '5',
        id: '5',
        key: '3lhec2v5ogt0dbpw',
        order: 3,
        title: 'date range',
        properties: null,
        conditional: null,
        widgetId: 'DATE_RANGE',
        width: 'FULL',
        version: 1,
        selected: true,
    },
    {
        clientId: '6',
        id: '6',
        key: '9qcmoxmr6cv2vey5',
        order: 4,
        title: 'time range',
        properties: null,
        conditional: null,
        widgetId: 'TIME_RANGE',
        width: 'FULL',
        version: 1,
        selected: false,
    }
  ])).toStrictEqual(['5']);
});
test('get report structure variant', () => {
  expect(getReportStructureVariant(undefined, undefined)).toStrictEqual(SECTOR_FIRST);
  expect(getReportStructureVariant([], undefined)).toStrictEqual(SECTOR_FIRST);
  expect(getReportStructureVariant([
    {
      id: "1",
      clientId: "1",
      key: "kpdn2663nioq6wqu",
      order: 1,
      properties: {
        rows: [
          {
            key: "ef14urs3ymfk23yy",
            cells: [
              {
                key: "n2ayqobf3zv6ycle",
                label: "ripe",
                order: 1
              }
            ],
            label: "apple",
            order: 1
          },
          {
            key: "o6o8y0bfki5sd1xa",
            cells: [
              {
                key: "ur4tz3nalikmrp80",
                label: "ripe",
                order: 1
              }
            ],
            label: "avocado",
            order: 2
          }
        ]
      },
      conditional: null,
      title: "fruits",
      widgetId: "MATRIX1D",
      width: "FULL",
      version: 1
    },
    {
      id: "2",
      clientId: "2",
      key: "qfepnxfmk0ytzh0a",
      order: 2,
      properties: {
        rows: [
          {
            key: "cw4vvh7j5e3q5rle",
            color: null,
            label: "color",
            order: 1,
            subRows: [
              {
                key: "bdwa0caijzu2vlfk",
                label: "primary",
                order: 1,
                tooltip: null
              },
              {
                key: "4q93bn1ss9o0qx58",
                label: "secondary",
                order: 2,
                tooltip: null
              }
            ],
            tooltip: null
          }
        ],
        columns: [
          {
            key: "zj93mmfo7jp4hpr7",
            label: "value",
            order: 1,
            tooltip: null,
            subColumns: [
              {
                key: "74hddg4ytza5dlka",
                label: "hari",
                order: 1,
                tooltip: null
              },
              {
                key: "zof6o8ltzdb58u15",
                label: "shyam",
                order: 2,
                tooltip: null
              }
            ]
          }
        ]
      },
      conditional: null,
      title: "color combinations",
      widgetId: "MATRIX2D",
      width: "FULL",
      version: 1
    },
    {
      clientId: "3",
      id: "3",
      key: "wmsn5hrtco52xu4x",
      order: 1,
      title: "text",
      properties: {},
      conditional: null,
      widgetId: "TEXT",
      width: "FULL",
      version: 1
    },
    {
      clientId: "4",
      id: "4",
      key: "2wabftmvlxtbz2p6",
      order: 2,
      title: "number",
      properties: {},
      conditional: null,
      widgetId: "NUMBER",
      width: "FULL",
      version: 1
    },
    {
      clientId: "5",
      id: "5",
      key: "3lhec2v5ogt0dbpw",
      order: 3,
      title: "date range",
      properties: null,
      conditional: null,
      widgetId: "DATE_RANGE",
      width: "FULL",
      version: 1
    },
    {
      clientId: "6",
      id: "6",
      key: "9qcmoxmr6cv2vey5",
      order: 4,
      title: "time range",
      properties: null,
      conditional: null,
      widgetId: "TIME_RANGE",
      width: "FULL",
      version: 1
    }
  ], [
    {
      "id": "uncategorized",
      "levels": []
    },
    {
      "id": "1",
      "levels": [
        {
          "id": "ef14urs3ymfk23yy",
          "levels": [
            {
              "id": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "levels": null
            }
          ]
        },
        {
          "id": "o6o8y0bfki5sd1xa",
          "levels": [
            {
              "id": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "levels": null
            }
          ]
        }
      ]
    },
    {
      "id": "2",
      "levels": [
        {
          "id": "cw4vvh7j5e3q5rle",
          "levels": [
            {
              "id": "cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
              "levels": [
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "levels": [
                    {
                      "id": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58"
                    },
                    {
                      "id": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58"
                    }
                  ]
                }
              ]
            },
            {
              "id": "cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
              "levels": [
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "levels": [
                    {
                      "id": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk"
                    },
                    {
                      "id": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ])).toStrictEqual(DIMENSION_FIRST);
  expect(getReportStructureVariant([
    {
      "id": "1",
      "clientId": "1",
      "key": "kpdn2663nioq6wqu",
      "order": 1,
      "properties": {
        "rows": [
          {
            "key": "ef14urs3ymfk23yy",
            "cells": [
              {
                "key": "n2ayqobf3zv6ycle",
                "label": "ripe",
                "order": 1
              }
            ],
            "label": "apple",
            "order": 1
          },
          {
            "key": "o6o8y0bfki5sd1xa",
            "cells": [
              {
                "key": "ur4tz3nalikmrp80",
                "label": "ripe",
                "order": 1
              }
            ],
            "label": "avocado",
            "order": 2
          }
        ]
      },
      "conditional": null,
      "title": "fruits",
      "widgetId": "MATRIX1D",
      "width": "FULL",
      "version": 1
    },
    {
      "id": "2",
      "clientId": "2",
      "key": "qfepnxfmk0ytzh0a",
      "order": 2,
      "properties": {
        "rows": [
          {
            "key": "cw4vvh7j5e3q5rle",
            "color": null,
            "label": "color",
            "order": 1,
            "subRows": [
              {
                "key": "bdwa0caijzu2vlfk",
                "label": "primary",
                "order": 1,
                "tooltip": null
              },
              {
                "key": "4q93bn1ss9o0qx58",
                "label": "secondary",
                "order": 2,
                "tooltip": null
              }
            ],
            "tooltip": null
          }
        ],
        "columns": [
          {
            "key": "zj93mmfo7jp4hpr7",
            "label": "value",
            "order": 1,
            "tooltip": null,
            "subColumns": [
              {
                "key": "74hddg4ytza5dlka",
                "label": "hari",
                "order": 1,
                "tooltip": null
              },
              {
                "key": "zof6o8ltzdb58u15",
                "label": "shyam",
                "order": 2,
                "tooltip": null
              }
            ]
          }
        ]
      },
      "conditional": null,
      "title": "color combinations",
      "widgetId": "MATRIX2D",
      "width": "FULL",
      "version": 1
    },
    {
      "clientId": "3",
      "id": "3",
      "key": "wmsn5hrtco52xu4x",
      "order": 1,
      "title": "text",
      "properties": {},
      "conditional": null,
      "widgetId": "TEXT",
      "width": "FULL",
      "version": 1
    },
    {
      "clientId": "4",
      "id": "4",
      "key": "2wabftmvlxtbz2p6",
      "order": 2,
      "title": "number",
      "properties": {},
      "conditional": null,
      "widgetId": "NUMBER",
      "width": "FULL",
      "version": 1
    },
    {
      "clientId": "5",
      "id": "5",
      "key": "3lhec2v5ogt0dbpw",
      "order": 3,
      "title": "date range",
      "properties": null,
      "conditional": null,
      "widgetId": "DATE_RANGE",
      "width": "FULL",
      "version": 1
    },
    {
      "clientId": "6",
      "id": "6",
      "key": "9qcmoxmr6cv2vey5",
      "order": 4,
      "title": "time range",
      "properties": null,
      "conditional": null,
      "widgetId": "TIME_RANGE",
      "width": "FULL",
      "version": 1
    }
  ], [
    {
      "id": "1",
      "levels": [
        {
          "id": "ef14urs3ymfk23yy",
          "levels": [
            {
              "id": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "levels": null
            }
          ]
        },
        {
          "id": "o6o8y0bfki5sd1xa",
          "levels": [
            {
              "id": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "levels": null
            }
          ]
        }
      ]
    },
    {
      "id": "2",
      "levels": [
        {
          "id": "zj93mmfo7jp4hpr7",
          "levels": [
            {
              "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "levels": [
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "levels": null
                },
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "levels": null
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "uncategorized",
      "levels": []
    }
  ])).toStrictEqual(SECTOR_FIRST);
});

test('is subsector included', () => {
  expect(isSubSectorIncluded(undefined)).toStrictEqual(false);
  expect(isSubSectorIncluded(null)).toStrictEqual(false);
  expect(isSubSectorIncluded([])).toStrictEqual(false);
  expect(isSubSectorIncluded([
    {
        "id": "1",
        "levels": [
            {
                "id": "ef14urs3ymfk23yy",
                "levels": [
                    {
                        "id": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
                        "levels": null
                    }
                ]
            },
            {
                "id": "o6o8y0bfki5sd1xa",
                "levels": [
                    {
                        "id": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
                        "levels": null
                    }
                ]
            }
        ]
    }
  ])).toStrictEqual(false);
  expect(isSubSectorIncluded([
    {
      "id": "1",
      "levels": [
        {
          "id": "ef14urs3ymfk23yy",
          "title": "apple",
          "levels": [
            {
              "id": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe"
            }
          ]
        },
        {
          "id": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "levels": [
            {
              "id": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe"
            }
          ]
        }
      ]
    },
    {
      "id": "2",
      "levels": [
        {
          "id": "zj93mmfo7jp4hpr7",
          "title": "value",
          "levels": [
            {
              "id": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka",
              "title": "hari",
              "levels": [
                {
                  "id": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle",
                  "title": "color",
                  "levels": [
                    {
                      "id": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                      "title": "primary"
                    },
                    {
                      "id": "zj93mmfo7jp4hpr7-74hddg4ytza5dlka-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                      "title": "secondary"
                    }
                  ]
                }
              ]
            },
            {
              "id": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15",
              "title": "shyam",
              "levels": [
                {
                  "id": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle",
                  "title": "color",
                  "levels": [
                    {
                      "id": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                      "title": "primary"
                    },
                    {
                      "id": "zj93mmfo7jp4hpr7-zof6o8ltzdb58u15-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                      "title": "secondary"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "uncategorized",
      "levels": []
    }
  ])).toStrictEqual(true);
});

test('sort report structure', () => {
  expect(sortReportStructure([
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
            }
          ]
        },
        {
          "key": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "selected": true,
          "nodes": [
            {
              "key": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe",
              "selected": true,
            }
          ]
        }
      ]
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "selected": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary",
                  "selected": true,
                },
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary",
                  "selected": true,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "nodes": []
    }
  ], [
    {
      "id": "uncategorized",
      "levels": []
    },
    {
      "id": "2",
      "levels": [
        {
          "id": "zj93mmfo7jp4hpr7",
          "levels": [
            {
              "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "levels": [
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk"
                },
                {
                  "id": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "1",
      "levels": [
        {
          "id": "ef14urs3ymfk23yy",
          "levels": [
            {
              "id": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle"
            }
          ]
        },
        {
          "id": "o6o8y0bfki5sd1xa",
          "levels": [
            {
              "id": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80"
            }
          ]
        }
      ]
    }
  ])).toStrictEqual([
    {
      "title": "Uncategorized",
      "key": "uncategorized",
      "selected": true,
      "nodes": []
    },
    {
      "title": "color combinations",
      "key": "2",
      "selected": true,
      "nodes": [
        {
          "key": "zj93mmfo7jp4hpr7",
          "title": "value",
          "selected": true,
          "nodes": [
            {
              "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle",
              "title": "color",
              "selected": true,
              "nodes": [
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-bdwa0caijzu2vlfk",
                  "title": "primary",
                  "selected": true,
                  "nodes": undefined,
                },
                {
                  "key": "zj93mmfo7jp4hpr7-cw4vvh7j5e3q5rle-4q93bn1ss9o0qx58",
                  "title": "secondary",
                  "selected": true,
                  "nodes": undefined,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "fruits",
      "key": "1",
      "selected": true,
      "nodes": [
        {
          "key": "ef14urs3ymfk23yy",
          "title": "apple",
          "selected": true,
          "nodes": [
            {
              "key": "ef14urs3ymfk23yy-n2ayqobf3zv6ycle",
              "title": "ripe",
              "selected": true,
              "nodes": undefined,
            }
          ]
        },
        {
          "key": "o6o8y0bfki5sd1xa",
          "title": "avocado",
          "selected": true,
          "nodes": [
            {
              "key": "o6o8y0bfki5sd1xa-ur4tz3nalikmrp80",
              "title": "ripe",
              "selected": true,
              "nodes": undefined,
            }
          ]
        }
      ]
    }
  ]);
});

test('get sorted widgets', () => {
  expect(selectAndSortWidgets([], [])).toStrictEqual([]);
  expect(selectAndSortWidgets([], undefined)).toStrictEqual([]);
  expect(selectAndSortWidgets(undefined, [])).toStrictEqual([]);
  expect(selectAndSortWidgets(undefined, [])).toStrictEqual([]);
  expect(selectAndSortWidgets([
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1
    }
  ], ['5', '6'])).toStrictEqual([
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1,
      selected: true
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1,
      selected: true
    }
  ]);
  expect(selectAndSortWidgets([
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1
    },
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1
    }
  ], ['6'])).toStrictEqual([
    {
      clientId: '6',
      id: '6',
      key: '9qcmoxmr6cv2vey5',
      order: 4,
      title: 'time range',
      properties: null,
      conditional: null,
      widgetId: 'TIME_RANGE',
      width: 'FULL',
      version: 1,
      selected: true
    },
    {
      clientId: '5',
      id: '5',
      key: '3lhec2v5ogt0dbpw',
      order: 3,
      title: 'date range',
      properties: null,
      conditional: null,
      widgetId: 'DATE_RANGE',
      width: 'FULL',
      version: 1,
      selected: false
    },

  ]);
});
