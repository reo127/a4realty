'use client';

import PropertyAIChat from '@/components/PropertyAIChat';
import { useRouter } from 'next/navigation';

/**
 * AI Property Assistant Page - ChatGPT style interface
 */
export default function AIAssistantPage() {
  const router = useRouter();

  /**
   * Handler for when user clicks "Schedule Site Visit" on a property
   */
  const handleScheduleVisit = (property) => {
    // Navigate to property details or show modal
    console.log('Schedule visit for:', property);
    alert(`Scheduling site visit for:\n\n${property.title}\n${property.location}\n\nContact: Sales Team`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <PropertyAIChat onScheduleVisit={handleScheduleVisit} />
    </div>
  );
}
