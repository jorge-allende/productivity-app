import React from 'react';

interface UsersHeaderProps {
  // Empty for now, can extend later if needed
}

export const UsersHeader: React.FC<UsersHeaderProps> = () => {
  return (
    <div className="mb-2">
      {/* Simplified header without navigation buttons */}
      <div className="h-12" /> {/* Spacer to match the height of BoardHeader */}
    </div>
  );
};