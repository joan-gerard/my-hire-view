interface ApplicationHeaderProps {
  company: string;
  role: string;
}

export default function ApplicationHeader({
  company,
  role,
}: ApplicationHeaderProps) {
  return (
    <div className="bg-white py-12 shadow-sm">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{company}</h1>
        <p className="mt-2 text-2xl text-gray-600">{role}</p>
      </div>
    </div>
  );
}
