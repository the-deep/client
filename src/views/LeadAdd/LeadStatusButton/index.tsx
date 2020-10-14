import React from 'react';

import { CandidateLeadsManagerContext } from '../CandidateLeadsManager';
import styles from './styles.scss';

interface CandidateLead {
    leadState: 'uploading' | 'complete' | 'nonPristine';
    data: {
        sourceType: 'disk' | 'website';
    };
    progress: number | undefined;
}

interface UploadProgressProps {
    total: number;
    progress: number;
}

function UploadProgress(props: UploadProgressProps) {
    const {
        total = 0,
        progress = 0,
    } = props;

    const circleRef = React.useRef<SVGCircleElement>(null);
    React.useEffect(() => {
        const { current: circle } = circleRef;
        const radius = circle?.r?.baseVal?.value || 0;
        const circumference = radius * 2 * Math.PI;

        if (circle) {
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = String(circumference);
        }
    }, []);

    React.useEffect(() => {
        const { current: circle } = circleRef;
        console.info(progress, circle);

        if (circle) {
            const progressPerUnit = total === 0 ? 0 : progress / total;
            const radius = circle?.r?.baseVal?.value || 0;
            const circumference = radius * 2 * Math.PI;
            const offset = String(circumference - (progressPerUnit * circumference));
            circle.style.strokeDashoffset = offset;
        }
    }, [progress, total]);

    return (
        <svg className={styles.uploadProgress}>
            <circle
                r="14"
                ref={circleRef}
            />
        </svg>
    );
}

interface LeadStatusButtonProps {
    className?: string;
}

function LeadStatusButtonProps(props: LeadStatusButtonProps) {
    const {
        className,
    } = props;


    const {
        candidateLeads,
        // showProcessingModal,
        // setProcessingModalVisibility,
    }: {
        candidateLeads: CandidateLead[];
    } = React.useContext(CandidateLeadsManagerContext);

    // console.info(candidateLeads);

    const [
        isUploadingLeads,
        uploadProgress,
        total,
    ] = React.useMemo(() => {
        const isUploading = candidateLeads.some(cl => (
            cl.data?.sourceType === 'disk' && cl.leadState === 'uploading'
        ));

        const fromLocalDisk = candidateLeads.filter(cl => cl.data?.sourceType === 'disk');
        const progress = fromLocalDisk.reduce((acc, cl) => {
            let newAcc = acc;
            if (cl.leadState === 'complete') {
                newAcc += 100;
            } else if (cl.leadState === 'uploading') {
                newAcc += +(cl.progress ?? 0);
            }

            return newAcc;
        }, 0);

        // const completed = candidateLeads.filter(cl => cl.leadState === 'complete');
        // const uploading = candidateLeads.filter(cl => cl.leadState === 'uploading');

        return [
            isUploading,
            progress,
            100 * fromLocalDisk.length,
        ];
    }, [candidateLeads]);

    return (
        <div className={className}>
            { !isUploadingLeads && (
                <UploadProgress
                    progress={uploadProgress}
                    total={total}
                />
            )}
        </div>
    );
}

export default LeadStatusButtonProps;

