type Props = {
  title: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, children }: Props) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">{title}</h2>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
