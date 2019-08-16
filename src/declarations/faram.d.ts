type PickPartial<I, T extends keyof I> = Partial<Pick<I, T>> & Omit<I, T>;

declare module '@togglecorp/faram' {
    import * as React from 'react';

    interface Clickable<T> {
        onClick: (value: { event: React.MouseEvent; params?: T }) => void;
        disabled?: boolean;
        changeDelay?: number;
    }

    interface FaramProps {
        faramElementName: string;
        faramAction?: () => void;
    }

    // eslint-disable-next-line import/prefer-default-export
    export function FaramActionElement<T, P extends Clickable<T>>(
        component: React.ComponentType<P>
    ): React.ComponentType<P | (PickPartial<P, 'onClick' | 'disabled' | 'changeDelay'> & FaramProps)>;
}
