import React from 'react';
import type { ILaterItem } from '../../types/later';
import LaterItem from './LaterItem';
import LaterEmptyState from './LaterEmptyState';

interface InProgressTabProps {
  items: ILaterItem[];
  onCreateReminder: () => void;
  onUpdate: (updatedItem: ILaterItem) => void;
  onDelete: (itemId: string) => void;
  onEdit: (item: ILaterItem) => void;
  isLoading: boolean;
}

const InProgressTab: React.FC<InProgressTabProps> = ({
  items,
  onCreateReminder,
  onUpdate,
  onDelete,
  onEdit,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#868686]">Loading...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return <LaterEmptyState status="in-progress" onCreateReminder={onCreateReminder} />;
  }

  return (
    <div className="max-w-4xl">
      {items.map((item) => (
        <LaterItem
          key={item._id}
          item={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default InProgressTab;
