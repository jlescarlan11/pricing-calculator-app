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
        <span
          className={`text-base font-bold tracking-tight transition-colors ${isOpen ? 'text-clay' : 'text-ink-900 group-hover:text-clay'}`}
        >
          {question}
        </span>
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
    question: 'What’s a good profit margin for food products?',
    answer:
      "Aim for a profit margin of 30% or more to stay healthy. For example, if a snack costs ₱70 to make and you sell it for ₱100, you keep ₱30 as profit. This 30% helps pay for your bills and allows you to save for your business's future.",
  },
  {
    question: 'How often should I change my prices?',
    answer:
      'Check your costs every month. If the price of main ingredients like flour or sugar goes up by ₱10 or more, update your selling price. This ensures you are always making money and not losing it to rising market prices.',
  },
  {
    question: 'Should I pay myself for my time?',
    answer:
      "Yes, always include your own labor in the cost. If you spend 2 hours making a batch, pay yourself at least ₱120 (based on ₱60 per hour). If you don't pay yourself, your business isn't truly earning a profit.",
  },
  {
    question: 'What if my electricity bill changes every month?',
    answer:
      'Use your highest monthly bill from the past year to be safe. If your bills range from ₱1,500 to ₱2,000, use ₱2,000 in your calculations. This way, you are always covered even during the most expensive months.',
  },
  {
    question: 'How do I deal with cheaper competitors?',
    answer:
      "Focus on better quality rather than the lowest price. Many customers will gladly pay ₱20 more for a product that tastes better, uses cleaner ingredients, or has nicer packaging. Don't lower your price if it means you stop earning a fair profit.",
  },
  {
    question: 'How do I research competitor prices accurately?',
    answer:
      "Look at similar products in your local area. Visit 3-5 nearby shops or check social media marketplaces (like FB Marketplace). Note their prices and quality. Remember to compare 'apples to apples'—if they use premium butter and you use margarine, their price will naturally be higher.",
  },
  {
    question: 'How many competitors should I track?',
    answer:
      'Focus on 3 to 5 direct competitors. Tracking too many can be overwhelming, while too few might not give you a clear picture of the market. Aim for a mix of similar small businesses and one or two slightly larger ones for perspective.',
  },
  {
    question: 'What details should I record during price research?',
    answer:
      "Beyond the selling price, note the product weight/size, packaging quality, and any unique selling points (like 'organic' or 'homemade'). This helps you understand if their price is higher because they offer more value, or if you're underpricing your own premium features.",
  },
  {
    question: 'How often should I update my competitor data?',
    answer:
      "Markets change quickly. Try to refresh your competitor benchmarks every 3-6 months, or whenever you notice a major shift in ingredient costs. Data older than 90 days is often considered 'stale' and may no longer reflect current market rates.",
  },
  {
    question: 'My price is much higher than my competitors. What should I do?',
    answer:
      "Don't panic! A higher price is fine if you can justify it. Highlight your use of premium ingredients, larger portions, or better service. If you can't justify the gap, look for ways to reduce costs or consider if you're targeting a different customer group that values quality over price.",
  },
];

export const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter(
      (faq) =>
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
          <span className="text-ink-900">Questions</span>
        </div>
      }
      className="w-full max-w-2xl mx-auto border-border-subtle shadow-none"
    >
      <div className="space-y-xl">
        <div className="relative [&_input]:pr-14">
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
              We couldn&apos;t find a match for &quot;{searchQuery}&quot;.
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
