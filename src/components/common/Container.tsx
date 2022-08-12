import { ReactElement, ReactNode } from "react";

type Props = {
    children: ReactNode;
};

const Container = ({ children }: Props ): ReactElement => {
    return (
        <div className="container grow mx-auto py-6 px-4 sm:p-6 sm:py-6">
            {children}
        </div>
    );
}

export default Container;