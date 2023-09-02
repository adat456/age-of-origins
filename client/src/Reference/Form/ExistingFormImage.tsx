import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteReferenceImage } from "../../Shared/sharedFunctions";

interface existingFormImageInterface {
    image: {
        src: string,
        alt: string
    },
    referenceid: string,
    src: string
};

const ExistingFormImage: React.FC<existingFormImageInterface> = function({ referenceid, image, src }) {
    const [ confirmationVis, setConfirmationVis ] = useState(false);

    const queryClient = useQueryClient();
    const deleteImage = useMutation({
        mutationFn: () => deleteReferenceImage({ referenceid, imagekey: src.slice(79) }),
        onSuccess: () => {
            queryClient.invalidateQueries(`reference-${referenceid}-images`)
        },
    });

    return (
        <div className="my-16">
            <img src={src} />
            <button type="button" className="secondary-btn" onClick={() => setConfirmationVis(true)}>Remove</button>
            {confirmationVis ?
                <div>
                    <p className="text-offwhite">Are you sure you want to remove this image? Removal is permanent and cannot be undone.</p>
                    <button type="button" className="primary-btn" onClick={() => setConfirmationVis(false)}>Go back</button>
                    <button type="button" className="secondary-btn" onClick={() => deleteImage.mutate()}>Confirm removal</button>
                </div> : null
            }
        </div>
    );
};

export default ExistingFormImage;