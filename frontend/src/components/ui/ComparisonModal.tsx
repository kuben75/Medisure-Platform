import type {IComparisonModalProps} from "../../types/ui.types.ts"
import Modal from "./Modal.tsx"
import Button from "./Button.tsx"

export default function ComparisonModal({isOpen, onClose, packages}: IComparisonModalProps) {
    if (packages.length === 0) return null


    return(
        <Modal isOpen={isOpen} onClose={onClose} >
            <div className="w-full overflow-x-auto">
                <h2 className="text-2xl font"></h2>
            </div>
        </Modal>
    )
}