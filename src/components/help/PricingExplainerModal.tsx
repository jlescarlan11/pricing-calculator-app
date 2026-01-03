import React from 'react';
import { Modal } from '../shared/Modal';
import { PricingGuide } from './PricingGuide';

interface PricingExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'markup' | 'margin';
}

export const PricingExplainerModal: React.FC<PricingExplainerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'markup',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pricing Strategies Explained"
      maxWidth="max-w-2xl"
    >
      <PricingGuide onAction={onClose} initialTab={initialTab} />
    </Modal>
  );
};
