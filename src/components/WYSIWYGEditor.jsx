'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then(mod => ({ default: mod.Editor })),
  { ssr: false }
);

// Import CSS
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default function WYSIWYGEditor({ value = '', onChange, placeholder = "Write your content here..." }) {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [isReady, setIsReady] = useState(false);

  // Initialize editor state from HTML value
  useEffect(() => {
    if (value && value !== '') {
      try {
        const contentBlock = htmlToDraft(value);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          const initialEditorState = EditorState.createWithContent(contentState);
          setEditorState(initialEditorState);
        }
      } catch (error) {
        console.error('Error parsing HTML:', error);
        setEditorState(EditorState.createEmpty());
      }
    }
    setIsReady(true);
  }, []);

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    
    // Convert to HTML and call onChange
    const contentState = newEditorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const htmlContent = draftToHtml(rawContent);
    
    onChange(htmlContent);
  };

  if (!isReady) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="wysiwyg-editor border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        placeholder={placeholder}
        editorStyle={{
          minHeight: '300px',
          padding: '16px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
        toolbarStyle={{
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '0'
        }}
        toolbar={{
          options: [
            'inline',
            'blockType', 
            'fontSize',
            'list',
            'textAlign',
            'colorPicker',
            'link',
            'image',
            'history'
          ],
          inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough']
          },
          blockType: {
            options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote'],
          },
          fontSize: {
            options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
          },
          list: {
            options: ['unordered', 'ordered', 'indent', 'outdent']
          },
          textAlign: {
            options: ['left', 'center', 'right', 'justify']
          },
          colorPicker: {
            colors: [
              'rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
              'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)',
              'rgb(0,168,133)', 'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)',
              'rgb(40,50,78)', 'rgb(0,0,0)', 'rgb(247,218,100)', 'rgb(251,160,38)',
              'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)', 'rgb(239,239,239)',
              'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
              'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)'
            ],
          },
          link: {
            options: ['link', 'unlink']
          },
          image: {
            urlEnabled: true,
            uploadEnabled: false,
            previewImage: true,
            alt: { present: true, mandatory: false }
          }
        }}
      />
      
      <style jsx global>{`
        .wysiwyg-editor .rdw-editor-toolbar {
          background-color: #f9fafb;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 0;
          padding: 8px;
        }
        .wysiwyg-editor .rdw-editor-main {
          min-height: 300px;
        }
        .wysiwyg-editor .rdw-dropdown-wrapper {
          background: white;
        }
        .wysiwyg-editor .rdw-dropdown-selectedtext {
          color: #374151;
        }
        .wysiwyg-editor .rdw-option-wrapper {
          border: 1px solid #d1d5db;
          margin: 0 2px;
          border-radius: 4px;
        }
        .wysiwyg-editor .rdw-option-wrapper:hover {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }
        .wysiwyg-editor .rdw-option-active {
          box-shadow: 0 0 0 2px #D7242A;
          background-color: #fee2e2;
        }
        .wysiwyg-editor .public-DraftEditor-content {
          min-height: 250px;
          padding: 16px;
        }
        .wysiwyg-editor .public-DraftEditorPlaceholder-root {
          color: #9ca3af;
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}