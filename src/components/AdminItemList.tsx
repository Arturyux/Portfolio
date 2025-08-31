import AdminForm from "./AdminForm";
import { motion, AnimatePresence } from "framer-motion";

export interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  description: string;
  year: string;
  upfront?: boolean;
  queuenumber?: number;
}

interface AdminItemListProps {
  items: PortfolioItem[];
  editingId: string | null;
  expandedProject: string | null;
  existingCategories: string[];
  editCategory: string;
  editTitle: string;
  editYear: string;
  editDescription: string;
  editUpfront: boolean;
  editQueuenumber: number;
  onStartEditing: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
  onToggleProject: (id: string) => void;
  onEditCategoryChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onEditYearChange: (value: string) => void;
  onEditUpfrontChange: (value: boolean) => void;
  onEditQueuenumberChange: (value: number) => void;
  onEditSubmit: (e: React.FormEvent, id: string, description: string) => void;
  onCancelEdit: () => void;
}

export default function AdminItemList({
  items,
  editingId,
  expandedProject,
  existingCategories,
  editCategory,
  editTitle,
  editYear,
  editDescription,
  editUpfront,
  editQueuenumber,
  onStartEditing,
  onDelete,
  onToggleProject,
  onEditCategoryChange,
  onEditTitleChange,
  onEditYearChange,
  onEditUpfrontChange,
  onEditQueuenumberChange,
  onEditSubmit,
  onCancelEdit,
}: AdminItemListProps) {
  return (
    <ul className="w-full space-y-2">
      {items.map((item) => (
        <li key={item.id} className="border border-gray-300 rounded-md overflow-hidden">
          <button
            onClick={() => onToggleProject(item.id)}
            className="w-full flex justify-between items-center p-4 text-left font-semibold bg-gray-50 hover:bg-gray-100"
          >
            <span>{item.title}</span>
            <span className="transform transition-transform duration-300" style={{ transform: expandedProject === item.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>
          <AnimatePresence>
            {expandedProject === item.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4"
              >
                {editingId === item.id ? (
                  <AdminForm
                    isEdit={true}
                    category={editCategory}
                    title={editTitle}
                    year={editYear}
                    description={editDescription}
                    upfront={editUpfront}
                    queuenumber={editQueuenumber}
                    existingCategories={existingCategories}
                    onCategoryChange={onEditCategoryChange}
                    onTitleChange={onEditTitleChange}
                    onYearChange={onEditYearChange}
                    onUpfrontChange={onEditUpfrontChange}
                    onQueuenumberChange={onEditQueuenumberChange}
                    onSubmit={(e, description) => onEditSubmit(e, item.id, description)}
                    onCancel={onCancelEdit}
                  />
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      <p>
                        <strong>Category:</strong> {item.category}
                      </p>
                      <p>
                        <strong>Year:</strong> {item.year}
                      </p>
                      <p>
                        <strong>Order:</strong> {item.queuenumber ?? 0}
                      </p>
                      <p>
                        <strong>Upfront:</strong> {item.upfront ? "✅ Yes" : "❌ No"}
                      </p>
                    </div>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => onStartEditing(item)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
  );
}