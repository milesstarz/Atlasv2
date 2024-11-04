import React, { useState } from 'react';
import { Trash2, Link, FileText, Image, File, ExternalLink } from 'lucide-react';
import { ContentItem } from '../types';

interface ContentCardProps {
  item: ContentItem;
  onRemove: () => void;
  layout: string;
}

export default function ContentCard({ item, onRemove, layout }: ContentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onRemove();
  };

  const getIcon = () => {
    switch (item.type) {
      case 'link':
        return <Link className="w-5 h-5" />;
      case 'text':
        return <FileText className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const cardClasses = layout === 'grid'
    ? 'group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl'
    : 'group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl flex';

  const renderContent = () => {
    if (item.type === 'image') {
      return (
        <img
          src={item.content}
          alt="Content preview"
          className={`${
            layout === 'grid'
              ? 'w-full h-32 object-cover rounded-md'
              : 'w-48 h-32 object-cover rounded-md'
          }`}
        />
      );
    }

    const content = item.content;
    const isLink = isValidUrl(content);

    if (isLink) {
      return (
        <div className={`${layout === 'grid' ? 'h-32' : 'flex-1'} overflow-hidden`}>
          <a
            href={content}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link flex items-start gap-2 text-gray-800 dark:text-gray-200 text-sm hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <span className="flex-1 break-all">{content}</span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        </div>
      );
    }

    return (
      <div className={`${layout === 'grid' ? 'h-32' : 'flex-1'} overflow-hidden`}>
        <p className="text-gray-800 dark:text-gray-200 text-sm">{content}</p>
      </div>
    );
  };

  return (
    <div className={cardClasses}>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleRemove}
          className={`p-2 rounded-full ${
            showConfirm
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className={layout === 'grid' ? 'p-3' : 'p-3 flex-1'}>
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
        </div>

        {renderContent()}

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}