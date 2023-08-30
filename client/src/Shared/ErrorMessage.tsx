interface errorMessageInterface {
    msg: string
};

const ErrorMessage: React.FC<errorMessageInterface> = function({ msg }) {
    return (
        <div className="flex items-start gap-8 my-8">
            <div className="bg-red p-4 rounded-full">
                <svg width="0.8rem" height="0.8rem" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#E0E3EB"><path d="M6.002 14a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm.195-12.01a1.81 1.81 0 1 1 3.602 0l-.701 7.015a1.105 1.105 0 0 1-2.2 0l-.7-7.015z"/></svg>
            </div>
            <p className="text-offwhite italic">{msg}</p>
        </div>
    );
};

export default ErrorMessage;