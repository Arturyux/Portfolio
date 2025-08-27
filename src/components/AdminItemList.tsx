import AdminForm from "./AdminForm";

export interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  description: string;
  year: string;
  upfront?: boolean;
}

interface AdminItemListProps {
  items: PortfolioItem[];
  editingId: string | null;
  existingCategories: string[];
  editCategory: string;
  editTitle: string;
  editYear: string;
  editDescription: string;
  editUpfront: boolean;
  onStartEditing: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
  onEditCategoryChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onEditYearChange: (value: string) => void;
  onEditUpfrontChange: (value: boolean) => void;
  onEditSubmit: (e: React.FormEvent, id: string, description: string) => void;
  onCancelEdit: () => void;
}

export default function AdminItemList({
  items,
  editingId,
  existingCategories,
  editCategory,
  editTitle,
  editYear,
  editDescription,
  editUpfront,
  onStartEditing,
  onDelete,
  onEditCategoryChange,
  onEditTitleChange,
  onEditYearChange,
  onEditUpfrontChange,
  onEditSubmit,
  onCancelEdit,
}: AdminItemListProps) {
  return (
    <ul className="w-full space-y-4">
      {items.map((item) => (
        <li key={item.id} className="p-4 border border-gray-300 rounded-md">
          {editingId === item.id ? (
            <AdminForm
              isEdit={true}
              category={editCategory}
              title={editTitle}
              year={editYear}
              description={editDescription}
              upfront={editUpfront}
              existingCategories={existingCategories}
              onCategoryChange={onEditCategoryChange}
              onTitleChange={onEditTitleChange}
              onYearChange={onEditYearChange}
              onUpfrontChange={onEditUpfrontChange}
              onSubmit={(e, description) => onEditSubmit(e, item.id, description)}
              onCancel={onCancelEdit}
            />
          ) : (
            <>
              <p>
                <strong>Category:</strong> {item.category}
              </p>
              <p>
                <strong>Title:</strong> {item.title}
              </p>
              <p>
                <strong>Year:</strong> {item.year}
              </p>
              <p>
                <strong>Upfront:</strong> {item.upfront ? "✅ Yes" : "❌ No"}
              </p>
              <div
                className="text-lg text-gray-700"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
              <div className="flex gap-2 mt-2">
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
        </li>
      ))}
    </ul>
  );
}