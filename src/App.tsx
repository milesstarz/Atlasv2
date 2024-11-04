import React, { useCallback, useMemo, useState } from 'react';
import { ContentItem } from './types';
import ContentGrid from './components/ContentGrid';
import SearchBar from './components/SearchBar';
import { Settings, HelpCircle } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [items, setItems] = useLocalStorage<ContentItem[]>('content-vault-items', []);
  const [searchQuery, setSearchQuery] = useLocalStorage<string>('content-vault-search', '');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', true);
  const [layout, setLayout] = useLocalStorage('grid-layout', 'grid');

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    let content = '';
    let type: ContentItem['type'] = 'text';

    if (clipboardData.types.includes('text/html')) {
      content = clipboardData.getData('text/html');
      type = 'article';
    } else if (clipboardData.types.includes('text/uri-list')) {
      content = clipboardData.getData('text/uri-list');
      type = 'link';
    } else if (clipboardData.types.includes('image/png') || clipboardData.types.includes('image/jpeg')) {
      const file = clipboardData.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            const newItem: ContentItem = {
              id: crypto.randomUUID(),
              type: 'image',
              content: e.target.result,
              tags: [],
              createdAt: new Date(),
            };
            setItems((prev) => [newItem, ...prev]);
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    } else {
      content = clipboardData.getData('text/plain');
    }

    if (content) {
      const newItem: ContentItem = {
        id: crypto.randomUUID(),
        type,
        content,
        tags: [],
        createdAt: new Date(),
      };
      setItems((prev) => [newItem, ...prev]);
    }
  }, [setItems]);

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const contentMatch = item.content.toLowerCase().includes(query);
      const tagsMatch = item.tags.some(tag => tag.toLowerCase().includes(query));
      const typeMatch = item.type.toLowerCase().includes(query);
      
      return contentMatch || tagsMatch || typeMatch;
    });
  }, [items, searchQuery]);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all items?')) {
      setItems([]);
      setSearchQuery('');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-gray-900 shadow-sm py-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <img
              src="https://i.imgur.com/yRn4Zb9.png"
              alt="Atlas Logo"
              className="h-12 w-auto"
            />
            <div className="w-full max-w-md relative">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6 flex items-center space-x-4">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {showHelp && (
          <div className="absolute top-20 right-6 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">What you can add:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>• Text content (Ctrl/Cmd + V)</li>
              <li>• Images from clipboard</li>
              <li>• Links (copy & paste URLs)</li>
              <li>• HTML content</li>
            </ul>
          </div>
        )}

        {showSettings && (
          <div className="absolute top-20 right-6 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Layout</span>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value)}
                  className="text-sm bg-gray-100 dark:bg-gray-700 border-none rounded"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Clear All Items
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentGrid items={filteredItems} onRemove={handleRemove} layout={layout} />
      </main>
    </div>
  );
}

export default App;