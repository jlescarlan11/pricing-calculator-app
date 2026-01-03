import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset rounded-lg transition-colors hover:bg-gray-50 px-2"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQS = [
  {
    question: "What’s a good profit margin for food products?",
    answer: "A healthy profit margin for most food businesses is typically between 25% and 35%. However, this can vary depending on your niche, overhead costs, and volume of sales. Always ensure your margin covers all your fixed costs and provides a sustainable profit."
  },
  {
    question: "How often should I recalculate prices?",
    answer: "It is recommended to review your prices monthly or whenever your ingredient/supply costs change by more than 10%. Keeping your pricing updated ensures you don't accidentally lose money as market prices fluctuate."
  },
  {
    question: "Should I include my time as a cost?",
    answer: "Yes, always! Many small business owners forget to pay themselves. Labor cost should be calculated based on the time you spend producing the product, multiplied by a fair hourly rate. This ensures your business is truly profitable and scalable."
  },
  {
    question: "What if my overhead changes every month?",
    answer: "If your overhead (like utilities or rent) fluctuates, use a 12-month average to stabilize your pricing. Alternatively, you can update your overhead calculations monthly if you prefer high precision, but an average is usually sufficient for consistent pricing."
  },
  {
    question: "How do I compete with lower prices?",
    answer: "Instead of a race to the bottom on price, focus on value, quality, and marketing. Highlight your unique ingredients, artisan process, or superior taste. Customers are often willing to pay more for quality and a brand they trust."
  }
];

export const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600" />
          <span>Frequently Asked Questions</span>
        </div>
      }
      className="w-full max-w-2xl mx-auto"
    >
      <div className="space-y-6">
        <div className="relative">
          <Input
            label="Search FAQ"
            placeholder="Search for questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Search className="absolute right-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        <div className="divide-y divide-gray-100">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => toggleItem(index)}
              />
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              No results found for &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>

        <div className="pt-4 text-center">
          <p className="text-sm text-gray-500">
            Still have questions? Feel free to contact us for more help.
          </p>
        </div>
      </div>
    </Card>
  );
};
