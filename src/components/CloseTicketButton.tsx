'use client';

import { useState, useRef } from 'react';
import { closeTicket } from '@/actions/ticket.actions';
import { toast } from 'sonner';

const CloseTicketButton = ({
    ticketId,
    ticketUuid,
    isClosed,
}: {
    ticketId: number;
    ticketUuid?: string;
    isClosed: boolean;
}) => {
    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const [resolution, setResolution] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Formatting helper
    const addFormatting = (before: string, after: string = before) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = resolution.substring(start, end);

        const newText =
            resolution.substring(0, start) +
            before + selectedText + after +
            resolution.substring(end);

        setResolution(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
        }, 10);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resolution.trim()) {
            toast.error('Resolution message is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('ticketId', ticketId.toString());
            if (ticketUuid) {
                formData.append('ticketId', ticketUuid);
            }
            formData.append('resolution', resolution);

            const result = await closeTicket(null, formData);

            if (result.success) {
                toast.success(result.message);
                setShowResolutionModal(false);
                setResolution('');
                setShowPreview(false);
                window.location.reload();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to close ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isClosed) return null;

    return (
        <>
            <button
                onClick={() => setShowResolutionModal(true)}
                className='bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition'
            >
                Close Ticket
            </button>

            {/* Resolution Modal */}
            {showResolutionModal && (
                <div className="fixed inset-0 backdrop-blur backdrop-brightness-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl">
                        <h2 className="text-xl font-bold mb-3">Close Ticket #{ticketId}</h2>
                        <p className="mb-4 text-gray-600 text-sm">
                            Please provide resolution details before closing.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Resolution Details *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
                                    >
                                        {showPreview ? '✏️ Edit' : '👁️ Preview'}
                                    </button>
                                </div>

                                {/* Formatting Toolbar */}
                                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('**', '**')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                        title="Bold"
                                    >
                                        <strong>B</strong>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('*', '*')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                        title="Italic"
                                    >
                                        <em>I</em>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('# ', '')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                        title="Heading"
                                    >
                                        H1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('## ', '')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                        title="Subheading"
                                    >
                                        H2
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('- ', '')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                        title="Bullet List"
                                    >
                                        •
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('1. ', '')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                        title="Numbered List"
                                    >
                                        1.
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('`', '`')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-mono"
                                        title="Code"
                                    >
                                        {`</>`}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addFormatting('>', '')}
                                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-mono"
                                        title="Code"
                                    >
                                        " "
                                    </button>

                                </div>

                                {/* Textarea or Preview */}
                                {showPreview ? (
                                    <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[128px] prose prose-sm max-w-none">
                                        <h1 className="text-lg font-bold">Preview:</h1>
                                        <div className="mt-2 whitespace-pre-wrap">
                                            {resolution.split('\n').map((line, i) => {
                                                if (line.startsWith('# ')) {
                                                    return <h1 key={i} className="text-xl font-bold mt-2">{line.substring(2)}</h1>;
                                                }
                                                if (line.startsWith('## ')) {
                                                    return <h2 key={i} className="text-lg font-bold mt-2">{line.substring(3)}</h2>;
                                                }
                                                if (line.startsWith('### ')) {
                                                    return <h3 key={i} className="text-md font-bold mt-1">{line.substring(4)}</h3>;
                                                }
                                                if (line.startsWith('- ') || line.startsWith('* ')) {
                                                    return <li key={i} className="ml-4">{line.substring(2)}</li>;
                                                }
                                                if (line.startsWith('> ')) {
                                                    return <blockquote key={i} className="border-l-4 border-gray-300 pl-3 italic">{line.substring(2)}</blockquote>;
                                                }
                                                return <p key={i}>{line}</p>;
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <textarea
                                        ref={textareaRef}
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Describe how you solved the problem...

Formatting tips:
# Main Heading
## Subheading
**Bold text**
*Italic text*
- Bullet points
1. Numbered list
`inline code`
> Quote"
                                        required
                                    />
                                )}

                                <div className="mt-2 text-xs text-gray-500">
                                    <p>💡 Use buttons above to format. Click "Preview" to see how it will look.</p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResolutionModal(false);
                                        setShowPreview(false);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Closing...' : 'Close Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CloseTicketButton;
