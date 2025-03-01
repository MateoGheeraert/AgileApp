import React from "react";
import { X } from "lucide-react"; // Import the close icon from Lucide

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative'>
        {/* Modal Header */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-black'>{title}</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div>{children}</div>

        {/* Modal Footer */}
        <div className='mt-4 flex justify-end space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
