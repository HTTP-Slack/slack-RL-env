interface PlaceholderSectionProps {
  title: string;
  description?: string;
}

export function PlaceholderSection({ title, description }: PlaceholderSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>

      <div className="py-12 text-center">
        <p className="text-gray-500">Settings for {title} will appear here.</p>
      </div>
    </div>
  );
}

