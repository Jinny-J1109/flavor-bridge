const tagColors: Record<string, string> = {
  Spicy: "bg-red-100 text-red-700",
  Sweet: "bg-pink-100 text-pink-700",
  Sour: "bg-yellow-100 text-yellow-700",
  Savory: "bg-amber-100 text-amber-700",
  Bitter: "bg-green-100 text-green-700",
  Crispy: "bg-orange-100 text-orange-700",
  Creamy: "bg-purple-100 text-purple-700",
  Umami: "bg-indigo-100 text-indigo-700",
  Fresh: "bg-emerald-100 text-emerald-700",
  Rich: "bg-amber-100 text-amber-800",
  Mild: "bg-sky-100 text-sky-700",
  Smoky: "bg-stone-100 text-stone-700",
};

const defaultColor = "bg-gray-100 text-gray-700";

export default function FlavorTags({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[tag] || defaultColor}`}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
