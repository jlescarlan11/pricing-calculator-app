import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button, Modal } from '../shared';
import { presetService } from '../../services/presetService';
import { usePresets } from '../../hooks/use-presets';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../shared/Toast';

export const DangerZone: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { refresh, presets } = usePresets();
  const { addToast } = useToast();

  const handleDeleteAll = async () => {
    try {
      await presetService.deleteAllPresets(user?.id);
      await refresh();
      addToast('All data permanently deleted', 'success');
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Failed to delete data', 'error');
    }
  };

  if (presets.length === 0) return null;

  return (
    <div className="border-2 border-rust rounded-xl p-xl bg-[#fef2f2]">
      <h3 className="text-lg font-medium text-rust mb-sm flex items-center gap-sm">
        <AlertTriangle className="w-5 h-5" />
        Danger Zone
      </h3>
      <p className="text-ink-700 mb-xl">Irreversible actions. Please proceed with caution.</p>

      <Button variant="danger" onClick={() => setIsModalOpen(true)}>
        <Trash2 className="w-4 h-4 mr-2" />
        Delete All Data
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Delete All Data?"
        maxWidth="max-w-[400px]"
        footer={
          <div className="flex justify-end gap-md">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAll}>
              Yes, Delete Everything
            </Button>
          </div>
        }
      >
        <p className="text-ink-700">
          This action will permanently remove all your saved products and settings.
          <span className="font-bold block mt-sm">This cannot be undone.</span>
        </p>
      </Modal>
    </div>
  );
};
