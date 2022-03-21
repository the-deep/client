import React from 'react';
import ReactMarkdown from 'react-markdown';
import { _cs } from '@togglecorp/fujs';
import {
    Card,
    Container,
} from '@the-deep/deep-ui';

import WelcomeContent from '#components/general/WelcomeContent';

import styles from './styles.css';

export const termsNotice = `
# DEEP TERMS OF USE

The [Data Entry &amp; Exploration Platform (DEEP)](https://thedeep.io/) is an open data platform managed by a multi-stakeholder Governance Board through the Danish Refugee Council (DRC) as administrative host and the Data Friendly Space (DFS) as main technical provider and host. These Terms of Use describe how DEEP is managed and how the platform should be used. These Terms will be updated as needed with noticed of significant updates posted on DEEP slack channel and DEEP Skype user group. All users of DEEP are bound to those terms and if in disagreement, you should discontinue use of DEEP.

If you have any questions or comments about these Terms or DEEP, please contact the DEEP Project Manager, [pm@thedeep.io](mailto:pm@thedeep.io).

## Account Management

### User account
DEEP is an open platform that anyone can create an account in and use. Registering with DEEP gives users access to set up projects, request to join existing projects, and access to an overview of projects available in DEEP. The user is obligated to review and sign a consent of storing of basic user data within the platform for administrative purposes.

### Project administrator
Anyone with a user account can create a new project in DEEP. The project administrator is considered to be the responsible publisher of the information and data uploaded to that project. The project administrator is also responsible for approving user access and rights of other users joining the project and verifying the identity of the requesters. The project administrator must review and sign a data sharing agreement and is obligated to ensure that ethical and legal considerations are taken within the project including responsibility for any copyright infringements. The information and data that will be uploaded to the project should meet the requirements set out in the _Data scope and criteria_-section below.

### Deletion of user profiles
A user may delete their user account at any time by contacting the DEEP admin. When you delete your account, DEEP will delete any personal data collected in order to create the account.

If a Project Administrator wishes to delete their DEEP account, the Project Administrator needs to appoint a new Project Administrator, or one will be given by default to the users with the longest tenure in the project. A log of Project Administrators will be maintained as a record of responsible publisher for the time period

## Data Scope and Criteria

**Type of data** which may be shared on DEEP:

- Qualitative (e.g., reports, articles, policy documents, needs assessments and response data) and quantitative data (e.g., dataset on impacted and vulnerable people and communities) in format supported by DEEP
- Any type of data that supports a project&#39;s objective

**Criteria of data** shared on DEEP:

- Public and restricted sources (leads) may not contain any personal data. Personal data is information, in any form, that relates to an identified or identifiable natural person.
- Public and restricted sources (leads) may not contain any sensitive non-personal data. This includes information which, while not relating to an identified or identifiable natural person, may, by reason of its sensitive context, put certain individuals or groups of individuals at risk of harm.
- Metadata of public and restricted sources are made available for all DEEP users as public view.
- Confidential sources (leads) may contain personal and sensitive data if in line with project objectives and treated with utmost confidentiality such as restricted user access and/or set-up of the project for private access only. Metadata for a private project is excluded for public view.
- Should copyrights apply to a source, appropriate restriction level should be applied and information thereof included in the source metadata.

## Data responsibility and sharing

### Responsible publisher
The Project Administrator is the responsible publisher for his/her project and must ensure that collaborators of the project follow DEEP&#39;s data sharing protocols. The Project Administrator needs to sign a Data sharing agreement with indication of level of openness of data.

Users may use DEEP to share data from other sources with appropriate metadata including any applicable copyright, restrictions or license to guide any onward sharing.

### Restriction levels

There are currently two levels of restriction impacting data sharing on DEEP:

• **Public:** Data can be shared with any user in DEEP and exported to anyone without restrictions. The data is unlikely to cause any harm to affected population or other individuals and is publicly available. The data can be shared across the platform for research purposes (for example development of NLP), available in joint repository and platform cross searches.

• **Confidential:** Data is considered confidential that could cause harm to affected population or other individuals our under copyright. Data is accessible only to members of the project or a specific segment of users but should be assigned access only with caution and due procedure. The Project Administrator can decide whether or not to grant access to the data. The data is not accessible in platform cross searches, joint repository or for other purposes. Other users will only be able to consult the metadata.

After exporting data from DEEP, users must follow any restrictions applied when using and further sharing the data.

After exporting data from DEEP, users must follow any restrictions applied when using and further sharing the data. Exports including confidential data will be marked and restriction metadata included in bibliography.

If a user notices personal or sensitive data shared publicly through DEEP they should contact support@thedeep.io immediately to request that the data be removed. The DEEP team will take action, removing public access to that data and contacting the project administrator.

## Data Management

### Open source
DEEP is an open-source data management system licensed under the AGPL-3.0 license under the Open Source Initiative and managed by Data Friendly Space (DFS), a United States non-profit (501 c3) based organization.

### Server storage
Data that is uploaded to DEEP is stored by DFS on servers provided by Amazon Web Services and long term backups are stored on [N2WS](https://n2ws.com/). Data is encrypted in transit and at rest. Data is hosted and processed in the United States.

- DFS will never alter any data uploaded to DEEP without permission from the Project Administrator.
- Data shared through DEEP will never be shared further by DFS without prior permission from Project Administrator either for research and/or training dataset for NLP.

### Deletion of data
Deleted data cannot be retrieved by users. Deleted sources are not currently purged from backups. Metadata continues to exist in backups of the database indefinitely.

## Generic Disclaimer of Liability

The users are responsible for the data they share on DEEP. DEEP, its governing members or DFS assumes no liability whatsoever for data shared on DEEP. Sharing data through DEEP does not imply the transfer of any rights over this data to DEEP. DEEP, its governing members or DFS disclaim all warranties, whether expressed or implied.

Data and information on DEEP do not imply the expression or endorsement of any opinion on the part of DEEP, DFS, or its governing members. This includes opinions concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries.

## Privacy Notice

User contact details and personal information are only stored for administrative purposes on the platform. A user has access to the data stored about themselves and can ask for deletion of the user profile. All personal data will be removed, except the log tracking upload and tagging of data.

DEEP upholds a high standard of data protection for any personal data of DEEP users. In case such personal data is exposed, DEEP will notify all affected individuals and remedy the incident.

DEEP maintains an email distribution list to continuously inform users of changes to the platform or other relevant updates, which can be unsubscribed from. These preferences can be managed in the User Profile.

DEEP complies with and personal data is processed according to [EU&#39;s General Data Protection Regulation (GDPR).](https://gdpr.eu/)

## Annex 1: User agreement and consent

When using this software you agree we store and process your basic personal data for administrative purposes on the DEEP platform. The legal basis for processing this data is because you give your consent. See details in the Terms of Use.

### Privacy notice

The Data Entry &amp; Exploration Platform (DEEP) is an open data platform managed by a multi-stakeholder Governance Board through the Danish Refugee Council (DRC) as administrative host and the Data Friendly Space (DFS) as main technical provider and host.

- User contact details and information are stored for administrative purposes on the platform.
- We collect name, email address, organization name and position from our users.
- We use this data when you create a user account to access our digital Use, so you can:
  - sign in securely
  - be contacted by other users or project administrator for project you have asked to join
  - receive updates on changes, new releases and policies through the DEEP mailing list
- You have access to the data stored about you and can delete your user profile. At deletion, all personal data will be removed, except the log tracking upload of data
- In case your personal data is exposed, DEEP will notify you and remedy the incident.
- We will share your data if we&#39;re required to do so by law.
- We will not sell or rent your data to third parties.
- You may be asked to provide feedback or take part in research about DEEP to improve our system.
- We&#39;ll store your data in our database for as long as you have an active account on DEEP.
  - If your account becomes inactive, we&#39;ll keep any data related to the user profile for 3 years.
- Your personal data is stored on Amazon Web Services in the US.
- We&#39;re committed to doing all that we can to keep your data secure. The data encryption helps prevent unauthorised access to or disclosure of personal data.

You have the right to:

- ask for information about how your personal data is processed
- ask for a copy of all the personal data you&#39;ve given to us
- ask for any mistakes in your personal data to be corrected
- ask for your personal data to be erased if we no longer need to hold it
- You can withdraw your consent at any time.

### Questions and complaints

Contact the DEEP-team if you have any questions about anything in this notice, think that your personal data has been misused or mishandled or want to ensure deletion of all your personal data.

Email: pm@thedeep.io

## Annex 2: Project administrator - Data sharing agreement

The DEEP principle is to share data with other DEEP users in the spirit of collaboration whenever possible. When you create a project as a project administrator you consent to sharing the public information uploaded and tagged in this project platform for cross searches, mapping and joint repository.

Data protection will be respected when applied. Restricted and confidential data will not be shared or accessible in platform cross searches, joint repository, or for any other purposes. You, as the Project Administrator can decide whether or not to grant access to specific users to restricted and confidential data.Other users will only be able to consult the metadata.

You also agree we can use the public information uploaded and tagged for research purposes to keep developing DEEP (i.e., development of Machine Learning or Natural Language Processing solutions).

Should you want to exclude all information including metadata about the project, please contact support@thedeep.io, to ask to set it up as a private project.

Please, contact pm@thedeep.io for any questions on the data sharing agreement.

### Data sharing protocols

The DEEP principle is to share data with other DEEP users in the spirit of collaboration whenever possible while respecting data protection where it applies.

## Responsible publisher
The Project Administrator is the responsible publisher for his/her project and needs to ensure that collaborators of the project follow the data sharing protocols. Users may use DEEP to share data from other sources with appropriate metadata including any applicable copyright, restrictions or license to guide any onward sharing.

## Restriction levels

There are currently two levels of restriction impacting data sharing on DEEP:

• **Public:** Data can be shared with any user in DEEP and exported to anyone without restrictions. The data is unlikely to cause any harm to affected population or other individuals and is publicly available. The data can be shared across the platform for research purposes (for example development of NLP), available in joint repository and platform cross searches.

• **Confidential:** Data is considered confidential that could cause harm to affected population or other individuals our under copyright. Data is accessible only to members of the project or a specific segment of users but should be assigned access only with caution and due procedure. The Project Administrator can decide whether or not to grant access to the data. The data is not accessible in platform cross searches, joint repository or for other purposes. Other users will only be able to consult the metadata.

After exporting data from DEEP, users must follow any restrictions applied when using and further sharing the data.

**Generic disclaimer of liability.** The users are responsible for the data they share on DEEP. DEEP, its governing members or DFS assumes no liability whatsoever for data shared on DEEP. Sharing data through DEEP does not imply the transfer of any rights over this data to DEEP. DEEP, its governing members or DFS disclaim all warranties, whether expressed or implied.

Data and information on DEEP do not imply the expression or endorsement of any opinion on the part of DEEP or its governing members. This includes opinions concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries.
`;

interface Props {
    className?: string;
}

function TermsOfService(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.termsOfService, className)}>
            <Card className={styles.card}>
                <WelcomeContent
                    className={styles.welcomeContent}
                />
                <Container
                    className={styles.rightContent}
                    heading="DEEP Terms of Use and Privacy Notice"
                    headingSize="extraLarge"
                    contentClassName={styles.content}
                >
                    <ReactMarkdown>
                        {termsNotice}
                    </ReactMarkdown>
                </Container>
            </Card>
        </div>
    );
}

export default TermsOfService;
