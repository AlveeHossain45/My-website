import { useEffect, useState, useMemo } from 'react';
import { list } from '../../utils/fakeApi.js';
import { DocumentTextIcon, VideoCameraIcon, LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// NEW: Helper for icons
const getIcon = (type) => {
    if (type === 'video') return <VideoCameraIcon className="w-8 h-8 text-red-500" />;
    if (type === 'link') return <LinkIcon className="w-8 h-8 text-blue-500" />;
    return <DocumentTextIcon className="w-8 h-8 text-gray-500" />;
};

export default function StudentResourcesPage() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => { /* ... load logic ... */ }, []);

  const categories = useMemo(() => ['All', ...new Set(resources.map(r => r.category))], [resources]);

  const filteredResources = useMemo(() => {
    return resources
      .filter(r => category === 'All' || r.category === category)
      .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [resources, searchTerm, category]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Learning Resources</h1>

      {/* NEW: Search and Filter controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute w-5 h-5 top-2.5 left-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search resources..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="py-2 pl-3 pr-8 border rounded-md">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* ENHANCED: Grid view for resources */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(r => (
          <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              {getIcon(r.type)}
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{r.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
                <span className="mt-2 inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700">{r.category}</span>
              </div>
            </div>
          </a>
        ))}
        {filteredResources.length === 0 && <p className="text-gray-500 col-span-full text-center">No resources match your criteria.</p>}
      </div>
    </div>
  );
}