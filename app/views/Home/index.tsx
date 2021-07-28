import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoDocumentTextOutline,
    IoBookmarkOutline,
    IoDocumentOutline,
    IoCheckmarkCircle,
} from 'react-icons/io5';
import {
    InformationCard,
    PercentageInformationCard,
    Container,
    ButtonLikeLink,
    SelectInput,
    useInputState,
} from '@the-deep/deep-ui';

import PageContent from '#components/PageContent';

import styles from './styles.css';

interface Project {
    id: number;
    title: string;
}

const emptyProjectList: Project[] = [];
const projectKeySelector = (p: Project) => p.id;
const projectLabelSelector = (p: Project) => p.title;

interface Props {
    className?: string;
}

function Home(props: Props) {
    const { className } = props;
    const [project, setProject] = useInputState<number | undefined>(undefined);

    return (
        <PageContent
            className={_cs(styles.home, className)}
            rightSideContent={(
                <>
                    <Container
                        heading="My Assignments"
                    >
                        You do not have any assignments
                    </Container>
                    <Container
                        heading="Recent Activity"
                    >
                        You do not have any recent activity
                    </Container>
                </>
            )}
            mainContentClassName={styles.mainContent}
        >
            <Container
                className={styles.summary}
                heading="Summary of my Projects"
                contentClassName={styles.content}
            >
                <InformationCard
                    icon={<IoDocumentTextOutline />}
                    value={8}
                    label="Projects"
                    variant="complement1"
                    coloredBackground
                />
                <InformationCard
                    icon={<IoBookmarkOutline />}
                    label="Total Added Sources"
                    value={250}
                    variant="accent"
                    coloredBackground
                />
                <PercentageInformationCard
                    icon={<IoDocumentOutline />}
                    value={78}
                    variant="complement2"
                    label="Sources Tagged"
                />
                <PercentageInformationCard
                    icon={<IoCheckmarkCircle />}
                    value={54}
                    label="Sources Tagged & Validated"
                    variant="complement1"
                />
            </Container>
            <Container
                className={styles.projectTaggingActivity}
                heading="Projects Tagging Activity"
                headingDescription="Last 3 months"
                inlineHeadingDescription
            >
                Not enough data to populate the chart
            </Container>
            <Container
                className={styles.recentProjects}
                heading="Recent Projects"
                headerActions={(
                    <>
                        <SelectInput
                            placeholder="Select Project"
                            name="project-list"
                            options={emptyProjectList}
                            keySelector={projectKeySelector}
                            labelSelector={projectLabelSelector}
                            variant="general"
                            value={project}
                            onChange={setProject}
                        />
                        <ButtonLikeLink to="#">
                            Set up a new Project
                        </ButtonLikeLink>
                    </>
                )}
            >
                You do not have any recent projects
            </Container>
        </PageContent>
    );
}

export default Home;
