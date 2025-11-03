import React, { useState, useEffect } from 'react';
import type { Column, ColumnType } from '../../types/list';

interface EditColumnModalProps {
  isOpen: boolean;
  column: Column | null;
  onClose: () => void;
  onSave: (column: Column) => void;
}

const EditColumnModal: React.FC<EditColumnModalProps> = ({
  isOpen,
  column,
  onClose,
  onSave,
}) => {
  const [fieldType, setFieldType] = useState<ColumnType>('text');
  const [fieldName, setFieldName] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [showFieldTypes, setShowFieldTypes] = useState(false);

  useEffect(() => {
    if (column) {
      setFieldType(column.type);
      setFieldName(column.name);
      setIsRequired(column.required || false);
      setOptions(column.options || []);
    }
  }, [column]);

  if (!isOpen || !column) return null;

  const fieldTypes: { type: ColumnType; label: string; icon: string }[] = [
    { type: 'text', label: 'Text', icon: 'T' },
    { type: 'int', label: 'Number', icon: '01' },
    { type: 'enum', label: 'Select', icon: '✓' },
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'bool', label: 'Tick box', icon: '☑' },
  ];

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleDeleteOption = (option: string) => {
    setOptions(options.filter((opt) => opt !== option));
  };

  const handleSave = () => {
    const updatedColumn: Column = {
      ...column,
      type: fieldType,
      name: fieldName,
      required: isRequired,
      options: fieldType === 'enum' ? options : undefined,
    };
    onSave(updatedColumn);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddOption();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2c2d31] rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Field type</h3>

        {/* Field Type Selector */}
        <div className="mb-4 relative">
          <button
            onClick={() => setShowFieldTypes(!showFieldTypes)}
            className="w-full px-3 py-2 bg-[#1a1d21] border border-gray-600 rounded text-white text-left flex items-center justify-between hover:border-gray-500"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#2c2d31] px-2 py-1 rounded">
                {fieldTypes.find((ft) => ft.type === fieldType)?.icon}
              </span>
              <span>{fieldTypes.find((ft) => ft.type === fieldType)?.label}</span>
            </div>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFieldTypes && (
            <div className="absolute z-10 w-full mt-1 bg-[#1a1d21] border border-gray-600 rounded shadow-lg">
              <div className="max-h-64 overflow-y-auto">
                {fieldTypes.map((ft) => (
                  <button
                    key={ft.type}
                    onClick={() => {
                      setFieldType(ft.type);
                      setShowFieldTypes(false);
                      if (ft.type !== 'enum') {
                        setOptions([]);
                      }
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[#2c2d31] transition-colors"
                  >
                    <span className="text-xs bg-[#2c2d31] px-2 py-1 rounded">
                      {ft.icon}
                    </span>
                    <span className="text-white text-left">{ft.label}</span>
                    {fieldType === ft.type && (
                      <svg
                        className="w-4 h-4 ml-auto text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Field Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Field name
          </label>
          <input
            type="text"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1d21] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            placeholder="Type"
          />
        </div>

        {/* Options for Enum Type */}
        {fieldType === 'enum' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selectable options
            </label>
            <div className="space-y-2 mb-3">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1a1d21] rounded"
                >
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-move"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                    />
                  </svg>
                  <span className="flex-1 text-white">{option}</span>
                  <button
                    onClick={() => handleDeleteOption(option)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type and enter to add"
              className="w-full px-3 py-2 bg-[#1a1d21] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Required Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="text-sm text-gray-300">Required field</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3a3b40] text-white rounded hover:bg-[#4a4b50] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!fieldName.trim() || (fieldType === 'enum' && options.length === 0)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditColumnModal;

