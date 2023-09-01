import React, { useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    useForm,
} from '@togglecorp/toggle-form';
import { Button } from '@the-deep/deep-ui';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';

import ReportBuilder from './ReportBuilder';
import Toc from './Toc';
import schema, { PartialFormType } from './schema';
import styles from './styles.css';

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
        value,
        setFieldValue,
    } = useForm(schema, defaultValue);

    const tableOfContents = useMemo(() => (
        value?.containers?.filter((item) => item.contentType === 'HEADING')
    ), [value?.containers]);
    console.log('here', value);

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
