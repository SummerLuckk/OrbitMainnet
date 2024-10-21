'use client';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
type Props = { children?: React.ReactNode; };

const ProgressProvider = ({ children }: Props) => {
    return (
        <>
            {children}
            <ProgressBar
                height="4px"
                color="#FFE227"
                options={{ showSpinner: false }}
                shallowRouting
            />
        </>
    );
};

export default ProgressProvider;