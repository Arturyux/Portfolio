import { motion } from 'framer-motion';

interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  description: string;
  year: string;
}

interface MainContentProps {
  selectedItem: PortfolioItem | undefined;
}

export default function MainContent({ selectedItem }: MainContentProps) {
  return (
    <motion.main
      key={selectedItem?.id || 'welcome'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-6"
    >
      {selectedItem ? (
        <div>
          <h2 className="text-3xl font-bold mb-4">{selectedItem.title} ({selectedItem.year || ''})</h2>
          <div
            className="text-lg text-gray-700"
            dangerouslySetInnerHTML={{ __html: selectedItem.description }}
          />
        </div>
      ) : (
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-4">Welcome to Artur Burlakin Portfolio</h2>
        </div>
      )}
    </motion.main>
  );
}