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
    <div className="border-b border-border-subtle last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-lg flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-clay/20 focus:ring-inset rounded-md transition-all duration-300 hover:bg-surface px-sm group"
        aria-expanded={isOpen}
      >
        <span className={`text-base font-bold tracking-tight transition-colors ${isOpen ? 'text-clay' : 'text-ink-900 group-hover:text-clay'}`}>{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-clay shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-ink-300 group-hover:text-clay shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mb-lg' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-sm text-ink-700 leading-relaxed font-medium text-sm max-w-[700px]">
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
        <div className="flex items-center gap-sm">
          <HelpCircle className="h-5 w-5 text-clay" />
          <span className="text-ink-900">Frequently Asked Questions</span>
        </div>
      }
      className="w-full max-w-2xl mx-auto border-border-subtle shadow-none"
    >
      <div className="space-y-xl">
        <div className="relative">
          <Input
            label="Search Knowledge"
            placeholder="Search for questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Search className="absolute right-lg top-[42px] h-5 w-5 text-ink-300 pointer-events-none opacity-50" />
        </div>

        <div className="divide-y divide-border-subtle">
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
            <div className="py-2xl text-center text-ink-500 font-medium">
              No results found for &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>

        <div className="pt-lg text-center border-t border-border-subtle">
          <p className="text-sm text-ink-500 font-medium leading-relaxed">
            Still have questions? We&apos;re here to help you price with intention.
          </p>
        </div>
      </div>
    </Card>
  );
};
