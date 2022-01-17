import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import WelcomeContent from '#components/general/WelcomeContent';

import styles from './styles.css';

const md = `
# DEEP Extension Privacy Policy
**Effective: February, 2019**

## General
DEEP extension strives to take every necessary precaution to safeguard all user information on
the platform.

## What information do we collect?
We only collect the URL for active tabs and send it to our server for extraction of relevant
information. This process is carried out only when extension is active.

## What information is stored?
The extracted information through the URL is stored along with the access token for thedeep.io
website.

## How we use your information?
We do not use any personal information.

## What information do we share?
We do not share your information with any parties unless required by law.

## How can I delete my data?
Since we do not store any personal data, there is no data to delete.

## How long do you keep my data for?
We only store data as long as you are logged into thedeep.io.
`;

interface Props {
    className?: string;
}

function ExtensionPrivacyPolicy(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.termsOfService, className)}>
            <Card className={styles.card}>
                <WelcomeContent
                    className={styles.welcomeContent}
                />
                <ReactMarkdown className={styles.rightContent}>
                    {md}
                </ReactMarkdown>
            </Card>
        </div>
    );
}

export default ExtensionPrivacyPolicy;
