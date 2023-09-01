import React, { useMemo } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import {
    useForm,
} from '@togglecorp/toggle-form';
import {
    useQuery,
    gql,
} from '@apollo/client';
import { Button } from '@the-deep/deep-ui';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';

import {
    PillarsForReportQuery,
    PillarsForReportQueryVariables,
} from '#generated/types';

import ReportBuilder from './ReportBuilder';
import Toc from './Toc';
import schema, {
    type PartialFormType,
    type ReportContainerType,
} from './schema';
import styles from './styles.css';

const PILLARS_FOR_REPORT = gql`
    query PillarsForReport(
        $projectId: ID!,
        $analysisId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysis(id: $analysisId) {
                id
                title
                pillars {
                    id
                    analyzedEntriesCount
                    informationGap
                    mainStatement
                    modifiedAt
                    title
                    filters
                    clientId
                    statements {
                        clientId
                        informationGaps
                        statement
                        reportText
                    }
                }
            }
        }
    }
`;

const defaultValue: PartialFormType = {
    containers: [
        {
            clientId: '1',
            row: 1,
            column: 1,
            width: 12,
            contentType: 'HEADING',
            contentConfiguration: {
                heading: {
                    variant: 'H1',
                    content: 'Heading 1',
                },
            },
        },
        {
            clientId: '3',
            row: 2,
            column: 1,
            width: 12,
            contentType: 'TEXT',
            contentConfiguration: {
                text: {
                    content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n",
                },
            },
        },
        {
            row: 3,
            column: 1,
            clientId: '1q2bff9cu2p8bec4',
            width: 12,
            contentType: 'HEADING',
            contentConfiguration: {
                heading: {
                    variant: 'H2',
                    content: 'Heading 1-1',
                },
            },
        },
        {
            row: 4,
            column: 1,
            clientId: '4f7go61enim1a6hb',
            width: 12,
            contentType: 'TEXT',
            contentConfiguration: {
                text: {
                    content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n",
                },
            },
        },
        {
            row: 5,
            column: 1,
            clientId: 'mv6iu7gf8jjw3vcg',
            width: 12,
            contentType: 'HEADING',
            contentConfiguration: {
                heading: {
                    variant: 'H2',
                    content: 'Heading 1-2',
                },
            },
        },
        {
            row: 6,
            column: 1,
            clientId: '8oge9qq2b7w696xk',
            width: 6,
            contentType: 'TEXT',
            contentConfiguration: {
                text: {
                    content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n",
                },
            },
        },
        {
            row: 6,
            column: 2,
            clientId: 'jcojqn94he65os1y',
            width: 6,
            contentType: 'TEXT',
            contentConfiguration: {
                text: {
                    content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n",
                },
            },
        },
    ],
};

interface Props {
    className?: string;
}

function ReportEdit(props: Props) {
    const {
        className,
    } = props;

    const {
        reportId,
        projectId,
    } = useParams<{
        reportId: string | undefined,
        projectId: string | undefined,
    }>();

    const analysisId = new URL(window.location.href).searchParams.get('analysis');

    const analysisVariables = useMemo(() => {
        if (!analysisId || !projectId) {
            return undefined;
        }
        return {
            analysisId,
            projectId,
        };
    }, [analysisId, projectId]);

    const {
        value,
        setFieldValue,
    } = useForm(schema, defaultValue);

    useQuery<PillarsForReportQuery, PillarsForReportQueryVariables>(
        PILLARS_FOR_REPORT,
        {
            skip: !analysisId || !projectId || !!reportId,
            variables: analysisVariables,
            onCompleted: (response) => {
                if (!response.project?.analysis?.pillars) {
                    return;
                }
                const {
                    pillars,
                } = response.project.analysis;

                const containers: ReportContainerType[] = pillars.reduce((acc, item) => {
                    const header: ReportContainerType = {
                        clientId: randomString(),
                        row: acc.length + 1,
                        column: 1,
                        width: 12,
                        contentType: 'HEADING' as const,
                        contentConfiguration: {
                            heading: {
                                content: item.title,
                                variant: 'H2',
                            },
                        },
                    };

                    return ([
                        ...acc,
                        header,
                        ...(item?.statements ?? []).map((statement, statementIndex) => ({
                            clientId: randomString(),
                            row: acc.length + 1 + statementIndex + 1,
                            column: 1,
                            width: 12,
                            contentType: 'TEXT' as const,
                            contentConfiguration: {
                                text: {
                                    content: [
                                        '#### Main Statement',
                                        statement.statement,
                                        '#### Information Gaps',
                                        statement.informationGaps,
                                        '#### My Analysis',
                                        statement.reportText,
                                    ].join('\n'),
                                },
                            },
                        })),
                    ]);
                }, [{
                    clientId: randomString(),
                    row: 1,
                    column: 1,
                    width: 12,
                    contentType: 'HEADING' as const,
                    contentConfiguration: {
                        heading: {
                            content: response.project.analysis.title,
                            variant: 'H1',
                        },
                    },
                }] as ReportContainerType[]);

                setFieldValue(containers, 'containers');
            },
        },
    );

    const tableOfContents = useMemo(() => (
        value?.containers?.filter((item) => item.contentType === 'HEADING')
    ), [value?.containers]);

    return (
        <div className={_cs(className, styles.reportEdit)}>
            <SubNavbar
                className={styles.header}
                heading="New Report"
                homeLinkShown
                defaultActions={(
                    <>
                        <BackLink
                            defaultLink="/"
                        >
                            Back
                        </BackLink>
                        <Button
                            name={undefined}
                            variant="primary"
                        >
                            Save
                        </Button>
                    </>
                )}
            />
            <div className={styles.content}>
                <div className={styles.leftContent}>
                    <Toc
                        data={tableOfContents}
                    />
                </div>
                <ReportBuilder
                    className={styles.rightContent}
                    value={value}
                    setFieldValue={setFieldValue}
                    disabled={false}
                    readOnly={false}
                />
            </div>
        </div>
    );
}

export default ReportEdit;
