import { createContext } from 'react';

export type CountMap = { [key in string]: number | undefined };

export interface CommentCountContextInterface {
    commentsCountMap: CountMap;
    setCommentsCountMap: React.Dispatch<React.SetStateAction<CountMap>>;
}

export const CommentCountContext = createContext<CommentCountContextInterface>({
    commentsCountMap: {},
    setCommentsCountMap: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('set comments count map called on context without a provider', value);
    },
});

export default CommentCountContext;
