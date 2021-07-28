import React from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import PageContent from '#components/PageContent';
import SimplifiedTexView, { Entry } from './SimplifiedTextView';

import styles from './styles.css';

const simplifiedText = `
Southeast Asia is fast becoming the region hardest hit by COVID-19, with the rate of infections racing ahead of previously worst-affected places like Latin America and India.

Save the Children is ‘deeply concerned' about the catastrophic impact that the widespread loss of lives and livelihoods will have on the region’s children, who have already been held back by the disruption to schooling and essential health services including routine immunisation.

The fast-spreading Delta variant, combined with a slow vaccine rollout across most of the region, has seen cases jump by around 37% over the past week to 127,000 daily cases.

Dr Yasir Arafat is a medical doctor and public health professional, providing technical advice to Save the Children’s COVID-19 response in Asia. He said:

“COVID-19 is spreading like wildfire in Southeast Asia, and the worst is still yet to come. Southeast Asia is one of the least vaccinated regions in the world. It also has an extremely low testing rate, so it’s likely that things are even worse than the data suggests.

“Epidemiological models predict that Southeast Asia could have as many as 2.3 million infections and 4,500 deaths each day, with more than half of all infections and deaths happening in Indonesia. The situation looks likely to deteriorate further in places like Thailand and the Philippines, as models predict that, at their peak, these countries could see as many as 75,000 daily new cases between them in late July to early August.

“Until now, children have been the hidden victims of this pandemic. Not anymore. Not only are countries like Indonesia seeing record numbers of children dying from the virus, but we’re also seeing an alarming rise in children missing out on routine vaccinations and nutrition services that are critical for their survival, which should ring major alarm bells. It is clear that, for children, the devastation of the past year will be felt long after the pandemic.”

Save the Children is calling for urgent collective action to close the global vaccine divide between wealthy countries and poorer countries, by ensuring countries have access to vaccines through COVAX and sharing the know-how, information, and technology needed for countries to manufacture the vaccine themselves.
`;

const defaultEntries: Entry[] = [
    /*
    {
        clientId: '1',
        excerpt: 'Save the Children is calling for urgent collective action',
        droppedExcerpt: 'Save the Children is calling for urgent collective action',
    },
    {
        clientId: '2',
        excerpt: 'Dr Yasir Arafat is a medical doctor',
        droppedExcerpt: 'Dr Yasir Arafat is a medical doctor',
    },
    {
        clientId: '3',
        excerpt: 'spreading like wildfire in Southeast Asia wooohoo',
        droppedExcerpt: 'spreading like wildfire in Southeast Asia',
    },
    */
];

interface Props {
    className?: string;
}

function Tagging(props: Props) {
    const {
        className,
    } = props;

    const [activeEntry, setActiveEntry] = React.useState<string | undefined>();
    const [entries, setEntries] = React.useState<Entry[]>(defaultEntries);

    const handleActiveEntryClear = React.useCallback(
        () => {
            setActiveEntry(undefined);
        },
        [],
    );

    const handleAddButtonClick = React.useCallback((excerpt) => {
        window.getSelection()?.removeAllRanges();
        setEntries((oldEntries) => ([
            ...oldEntries,
            {
                clientId: randomString(),
                excerpt,
                droppedExcerpt: excerpt,
            },
        ]));
    }, [setEntries]);

    return (
        <PageContent
            className={_cs(styles.tagging, className)}
            mainContentClassName={styles.mainContent}
        >
            <SimplifiedTexView
                className={styles.simplifiedView}
                text={simplifiedText}
                entries={entries}
                onExcerptClick={setActiveEntry}
                onApproveButtonClick={handleActiveEntryClear}
                onDiscardButtonClick={handleActiveEntryClear}
                activeEntryClientId={activeEntry}
                onAddButtonClick={handleAddButtonClick}
            />
            <div className={styles.taggingPlayground}>
                Tagging playground
            </div>
        </PageContent>
    );
}

export default Tagging;
